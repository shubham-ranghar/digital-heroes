"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

import { useCountUp } from "@/hooks/use-count-up";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

/** Real currency amount that counts up once when scrolled into view. */
export function CountUpCurrency({
  value,
  className,
  duration = 900,
}: {
  value: number;
  className?: string;
  /** Count-up length in ms. */
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { text } = useCountUp(ref, value, {
    enabled: inView,
    duration,
    // Whole numbers mid-count so the width doesn't jitter; exact value at rest.
    format: (current) =>
      formatCurrency(current >= value ? value : Math.round(current)),
  });

  return (
    <span ref={ref} className={cn(tabularImpact, className)}>
      {text}
    </span>
  );
}
