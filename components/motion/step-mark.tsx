"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SVG_WIDTH = 32;
const STEP_HEIGHT = 8;
const STEP_COUNT = 3;
const SVG_HEIGHT = STEP_HEIGHT * STEP_COUNT;

type StepMarkProps = {
  className?: string;
};

export function StepMark({ className }: StepMarkProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const steps = [1, 0.66, 0.33].map((widthRatio, index) => {
    const w = SVG_WIDTH * widthRatio;
    const x = (SVG_WIDTH - w) / 2;
    const y = SVG_HEIGHT - STEP_HEIGHT * (index + 1);
    return { w, x, y, index };
  });

  return (
    <span
      ref={ref}
      className={cn("inline-flex items-end justify-center", className)}
      aria-hidden
    >
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="block shrink-0 text-current"
        shapeRendering="crispEdges"
      >
        {steps.map(({ w, x, y, index }) => {
          const originX = x + w / 2;
          const originY = y + STEP_HEIGHT;

          if (reduceMotion) {
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={w}
                height={STEP_HEIGHT}
                fill="currentColor"
              />
            );
          }

          const animIndex = STEP_COUNT - 1 - index;

          return (
            <motion.rect
              key={index}
              x={x}
              y={y}
              width={w}
              height={STEP_HEIGHT}
              fill="currentColor"
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              style={{ transformOrigin: `${originX}px ${originY}px` }}
              transition={{
                duration: DURATION.fast,
                delay: animIndex * 0.09,
                ease: EASE_OUT,
              }}
            />
          );
        })}
      </svg>
    </span>
  );
}
