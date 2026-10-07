"use client";

import { motion, useReducedMotion } from "framer-motion";

import { DURATION, EASE_OUT, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

const COLUMN_STEPS = [1, 2, 3, 2, 1] as const;
const COLS = COLUMN_STEPS.length;
const MAX_STEPS = 3;

export type SteppedEdgePosition = "top" | "bottom";

type SteppedEdgeProps = {
  position: SteppedEdgePosition;
  color?: string;
  className?: string;
  /** Play step stagger on mount (hero) instead of in-view. */
  playOnMount?: boolean;
};

function buildZigguratPath(position: SteppedEdgePosition): string {
  const colW = 100 / COLS;
  const points: string[] = [];

  if (position === "top") {
    points.push(`0,${MAX_STEPS}`);
    let x = 0;
    for (let i = 0; i < COLS; i++) {
      const yTop = MAX_STEPS - COLUMN_STEPS[i];
      points.push(`${x},${yTop}`, `${x + colW},${yTop}`);
      x += colW;
    }
    points.push(`100,${MAX_STEPS}`);
  } else {
    points.push("0,0", "100,0", `100,${MAX_STEPS}`);
    let x = 100;
    for (let i = COLS - 1; i >= 0; i--) {
      const yBottom = COLUMN_STEPS[i];
      points.push(`${x},${yBottom}`, `${x - colW},${yBottom}`);
      x -= colW;
    }
    points.push("0,0");
  }

  return `M ${points.join(" L ")} Z`;
}

export function SteppedEdge({
  position,
  color = "var(--navy)",
  className,
  playOnMount = false,
}: SteppedEdgeProps) {
  const reduceMotion = useReducedMotion();
  const path = buildZigguratPath(position);
  const colW = 100 / COLS;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "h-[48px] md:h-[96px]",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox={`0 0 100 ${MAX_STEPS}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        shapeRendering="crispEdges"
      >
        {reduceMotion ? (
          <path d={path} fill={color} />
        ) : (
          COLUMN_STEPS.map((steps, index) => {
            const x = index * colW;
            const height = steps;
            const finalY =
              position === "top" ? MAX_STEPS - height : 0;
            const initialY = position === "top" ? MAX_STEPS : -height;

            const stepTransition = {
              duration: DURATION.base,
              delay: index * 0.06,
              ease: EASE_OUT,
            };

            return (
              <motion.rect
                key={index}
                x={x}
                width={colW}
                height={height}
                fill={color}
                initial={{ y: initialY }}
                animate={playOnMount ? { y: finalY } : undefined}
                whileInView={playOnMount ? undefined : { y: finalY }}
                viewport={playOnMount ? undefined : { once: true, margin: "-40px" }}
                transition={stepTransition}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
