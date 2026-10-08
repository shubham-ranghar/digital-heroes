"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type LineRevealProps = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldPlay = playOnMount || inView;

  if (reduceMotion) {
    return (
      <div ref={ref} className={cn(className)}>
        {lines.map((line, index) => (
          <div key={index} className={lineClassName}>{line}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn(className)}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <m.span
            className={cn("block", lineClassName)}
            initial={{ y: "110%" }}
            animate={shouldPlay ? { y: 0 } : { y: "110%" }}
            transition={{
              duration: DURATION.slow,
              ease: EASE_OUT,
              delay: delay + index * 0.08,
            }}
          >
            {line}
          </m.span>
        </span>
      ))}
    </div>
  );
}
