"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";

import {
  STEPPED_EDGE_COLUMNS_FIVE,
  STEPPED_EDGE_COLUMNS_THREE,
  STEPPED_EDGE_ORDER_FIVE,
  STEPPED_EDGE_ORDER_THREE,
  columnRevealProgress,
} from "@/lib/stepped-edge-config";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SteppedEdgePosition = "top" | "bottom";

type SteppedEdgeProps = {
  position: SteppedEdgePosition;
  color?: string;
  className?: string;
  scrollTargetRef?: RefObject<HTMLElement | null>;
  playOnMount?: boolean;
  static?: boolean;
  /** Fill the band rectangle (section seams). Overlay reveals should leave this off. */
  fillBand?: boolean;
  variant?: "five" | "three";
};

function useMdUp() {
  const [mdUp, setMdUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setMdUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mdUp;
}

export function SteppedEdge({
  position,
  color = "var(--navy)",
  className,
  scrollTargetRef,
  playOnMount = false,
  static: staticVisible = false,
  fillBand = true,
  variant = "five",
}: SteppedEdgeProps) {
  const reduceMotion = useReducedMotion();
  const mdUp = useMdUp();
  const fallbackRef = useRef<HTMLDivElement>(null);
  const targetRef = scrollTargetRef ?? fallbackRef;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start 55%"],
  });

  const columns =
    variant === "three" ? STEPPED_EDGE_COLUMNS_THREE : STEPPED_EDGE_COLUMNS_FIVE;
  const order =
    variant === "three" ? STEPPED_EDGE_ORDER_THREE : STEPPED_EDGE_ORDER_FIVE;

  const stepPx = mdUp ? 32 : 16;
  const maxUnits = Math.max(...columns);
  const bandHeight = maxUnits * stepPx;
  const showStatic = staticVisible || reduceMotion;
  const alignEnd = position === "top";
  const navTheme =
    color.includes("cream") || color === "var(--cream)" ? "light" : "dark";

  return (
    <div
      ref={fallbackRef}
      data-nav-theme={navTheme}
      className={cn(
        "pointer-events-none relative w-full overflow-hidden",
        position === "top" ? "-mb-px" : "-mt-px",
        className,
      )}
      style={{
        height: bandHeight,
        backgroundColor: fillBand ? color : "transparent",
      }}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 flex",
          alignEnd ? "items-end" : "items-start",
        )}
      >
        {columns.map((units, colIndex) => {
          const colHeight = units * stepPx;
          const orderIndex = Math.max(
            0,
            (order as readonly number[]).indexOf(colIndex),
          );

          return (
            <div
              key={colIndex}
              className="flex min-w-0 flex-1 flex-col justify-end"
            >
              <SteppedEdgeColumn
                color={color}
                heightPx={colHeight}
                orderIndex={orderIndex}
                scrollYProgress={scrollYProgress}
                playOnMount={playOnMount}
                staticVisible={Boolean(showStatic)}
                columnCount={columns.length}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SteppedEdgeColumn({
  color,
  heightPx,
  orderIndex,
  scrollYProgress,
  playOnMount,
  staticVisible,
  columnCount,
}: {
  color: string;
  heightPx: number;
  orderIndex: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  playOnMount: boolean;
  staticVisible: boolean;
  columnCount: number;
}) {
  const scrubY = useTransform(scrollYProgress, (p) => {
    const progress = columnRevealProgress(p, orderIndex, 0.12, columnCount);
    return `${(1 - progress) * 100}%`;
  });

  if (staticVisible) {
    return (
      <div
        className="w-full shrink-0"
        style={{ height: heightPx, backgroundColor: color }}
      />
    );
  }

  if (playOnMount) {
    return (
      <motion.div
        className="w-full shrink-0 will-change-transform"
        style={{ height: heightPx, backgroundColor: color }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{
          duration: DURATION.base,
          delay: orderIndex * 0.06,
          ease: EASE_OUT,
        }}
      />
    );
  }

  return (
    <motion.div
      className="w-full shrink-0 will-change-transform"
      style={{
        height: heightPx,
        backgroundColor: color,
        y: scrubY,
      }}
    />
  );
}
