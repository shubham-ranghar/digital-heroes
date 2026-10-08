"use client";

import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type CSSProperties, type RefObject } from "react";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrubFlag } from "@/hooks/use-scrub-flag";
import {
  STEPPED_EDGE_COLUMNS_FIVE,
  STEPPED_EDGE_COLUMNS_THREE,
  STEPPED_EDGE_ORDER_FIVE,
  STEPPED_EDGE_ORDER_THREE,
  columnScrollRange,
} from "@/lib/stepped-edge-config";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SteppedEdgePosition = "top" | "bottom";
export type SteppedEdgeTrigger = "scroll" | "mount";
type SteppedEdgeVariant = "five" | "three";

type SteppedEdgeProps = {
  position: SteppedEdgePosition;
  /** Column colour. */
  color?: string;
  /** Band colour behind the columns when `fillBand` is on; defaults to `color`. */
  bandColor?: string;
  className?: string;
  /**
   * `scroll` scrubs the columns with scroll progress; `mount` plays a timed
   * reveal once (hero, route overlays).
   */
  trigger?: SteppedEdgeTrigger;
  /** Element whose top edge drives scroll progress (defaults to the band). */
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** Render fully revealed with no motion. Reduced motion implies this. */
  static?: boolean;
  /** Fill the band rectangle (section seams). Overlay reveals should leave this off. */
  fillBand?: boolean;
  /** Fixed column layout. Scroll edges default to five on md+, three below. */
  variant?: SteppedEdgeVariant;
};

const COLUMNS = {
  five: { units: STEPPED_EDGE_COLUMNS_FIVE, order: STEPPED_EDGE_ORDER_FIVE },
  three: { units: STEPPED_EDGE_COLUMNS_THREE, order: STEPPED_EDGE_ORDER_THREE },
} as const;

/** Column step size lives in CSS so band height never depends on hydration. */
const STEP_CLASS = "[--step-edge:16px] md:[--step-edge:32px]";

type ColumnSpec = {
  key: number;
  orderIndex: number;
  style: CSSProperties;
};

export function SteppedEdge({
  position,
  color = "var(--navy)",
  bandColor,
  className,
  trigger = "scroll",
  scrollTargetRef,
  static: staticVisible = false,
  fillBand = true,
  variant,
}: SteppedEdgeProps) {
  const hydrated = useClientMounted();
  const reduceMotion = useReducedMotion();
  const mdUp = useMediaQuery("(min-width: 768px)");
  const bandRef = useRef<HTMLDivElement>(null);

  // Mobile keeps the scroll scrub but drops to three columns rather than
  // switching to an on-enter reveal: the scrub shares framer's single scroll
  // listener and only writes three compositor transforms per frame, while
  // on-enter would add an IntersectionObserver plus a JS tween per column for
  // no saving, and would feel different from desktop.
  const resolvedVariant: SteppedEdgeVariant =
    variant ?? (trigger === "scroll" && !mdUp ? "three" : "five");
  const { units, order } = COLUMNS[resolvedVariant];
  const maxUnits = Math.max(...units);

  const columns: ColumnSpec[] = units.map((count, colIndex) => ({
    key: colIndex,
    orderIndex: Math.max(0, (order as readonly number[]).indexOf(colIndex)),
    style: {
      height: `calc(var(--step-edge) * ${count})`,
      backgroundColor: color,
    },
  }));

  // Server and hydration render a motionless, unrevealed frame (matching every
  // animated start state); the real mode is picked once preferences are known,
  // so reduced motion never mounts a scroll listener at all.
  const mode = staticVisible
    ? "static"
    : !hydrated
      ? "pending"
      : reduceMotion
        ? "static"
        : trigger;

  const navTheme = color.includes("cream") ? "light" : "dark";

  return (
    <div
      ref={bandRef}
      data-nav-theme={navTheme}
      className={cn(
        "pointer-events-none relative w-full overflow-hidden",
        STEP_CLASS,
        position === "top" ? "-mb-px" : "-mt-px",
        className,
      )}
      style={{
        height: `calc(var(--step-edge) * ${maxUnits})`,
        backgroundColor: fillBand ? (bandColor ?? color) : "transparent",
      }}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 flex",
          position === "top" ? "items-end" : "items-start",
        )}
      >
        {mode === "scroll" ? (
          <ScrollColumns
            columns={columns}
            targetRef={scrollTargetRef ?? bandRef}
          />
        ) : (
          columns.map((column) => (
            <div key={column.key} className={COLUMN_SLOT}>
              {mode === "mount" ? (
                <m.div
                  className="w-full shrink-0"
                  style={column.style}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: DURATION.base,
                    delay: column.orderIndex * 0.06,
                    ease: EASE_OUT,
                  }}
                />
              ) : (
                <div
                  className="w-full shrink-0"
                  style={
                    mode === "pending"
                      ? { ...column.style, transform: "translateY(100%)" }
                      : column.style
                  }
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const COLUMN_SLOT = "flex min-w-0 flex-1 flex-col justify-end";

/**
 * Progress runs from the target's top entering the viewport to it reaching
 * the centre. The target must be in normal flow (curtain sections pass their
 * outer wrapper, not the sticky inner), so progress stays continuous while an
 * earlier section is pinned.
 */
function ScrollColumns({
  columns,
  targetRef,
}: {
  columns: ColumnSpec[];
  targetRef: RefObject<HTMLElement | null>;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"],
  });
  // Columns are promoted only mid-scrub; at rest they're plain painted blocks.
  useScrubFlag(scrollYProgress, groupRef);

  return (
    <div ref={groupRef} className="group/edge contents">
      {columns.map((column) => (
        <div key={column.key} className={COLUMN_SLOT}>
          <ScrollColumn
            progress={scrollYProgress}
            range={columnScrollRange(column.orderIndex, columns.length)}
            style={column.style}
          />
        </div>
      ))}
    </div>
  );
}

function ScrollColumn({
  progress,
  range,
  style,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  style: CSSProperties;
}) {
  const y = useTransform(progress, [range[0], range[1]], ["100%", "0%"]);

  return (
    <m.div
      className="w-full shrink-0 group-data-scrubbing/edge:will-change-transform"
      style={{ ...style, y }}
    />
  );
}
