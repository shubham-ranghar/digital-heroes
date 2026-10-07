"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type LineRevealProps = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  /** When true, plays on mount (hero) instead of in-view. */
  playOnMount?: boolean;
  delay?: number;
};

export function LineReveal({
  lines,
  className,
  lineClassName,
  playOnMount = false,
  delay = 0,
}: LineRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={cn(className, "contents")}>
        {lines.map((line, index) => (
          <div key={index} className={lineClassName}>{line}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(className, "contents")}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              duration: DURATION.base,
              ease: EASE_OUT,
              delay: delay + index * 0.08,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
