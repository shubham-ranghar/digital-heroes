"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

import { useCountUp } from "@/hooks/use-count-up";
import { COUNT_UP } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type ImpactCountProps = {
  value: number;
  format: (value: number) => string;
  /** Rendered before the counting digits (e.g. the currency symbol). */
  prefix?: string;
  /**
   * Count as soon as it mounts. For figures in the first viewport, which may
   * sit below the 40% line and would otherwise read ₹0 until a scroll.
   */
  startOnMount?: boolean;
  className?: string;
};

/**
 * One impact number that counts up once, when it reaches 40% up the
 * viewport (or on mount, above the fold). Reduced motion shows the final
 * value (see `useCountUp`).
 */
export function ImpactCount({
  value,
  format,
  prefix,
  startOnMount = false,
  className,
}: ImpactCountProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: COUNT_UP.inViewMargin });
  const { text } = useCountUp(countRef, value, {
    enabled: startOnMount || inView,
    duration: COUNT_UP.durationMs,
    format,
  });

  return (
    <span ref={ref} className={cn(tabularImpact, className)}>
      {prefix}
      <span ref={countRef}>{text}</span>
    </span>
  );
}
