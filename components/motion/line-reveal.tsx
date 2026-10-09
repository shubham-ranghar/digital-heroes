"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { REVEAL, revealDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

type LineRevealProps = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  playOnMount?: boolean;
  delay?: number;
  duration?: number;
};

export function LineReveal({
  lines,
  className,
  lineClassName,
  playOnMount = false,
  delay = 0,
  duration = REVEAL.duration,
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
        // The mask bleeds past the line box (padding, cancelled by negative
        // margin) so italic overhangs and descenders aren't cropped.
        <span
          key={index}
          className="mx-[-0.08em] mb-[-0.16em] block overflow-hidden px-[0.08em] pb-[0.16em]"
        >
          <m.span
            className={cn("block", lineClassName)}
            initial={{ y: "130%" }}
            animate={shouldPlay ? { y: 0 } : { y: "130%" }}
            transition={{
              duration,
              ease: REVEAL.ease,
              delay: revealDelay(index, delay),
            }}
          >
            {line}
          </m.span>
        </span>
      ))}
    </div>
  );
}
