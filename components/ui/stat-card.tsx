"use client";

import { useInView } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
  animate?: boolean;
  /** Count-up length in ms; the count starts when the card scrolls into view. */
  duration?: number;
  /** When set, shown instead of prefix + animated value (e.g. `CountUpCurrency`). */
  valueLabel?: ReactNode;
};

/** Dashboard metric tile with optional count-up animation. */
export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon: Icon,
  trend,
  className,
  animate = true,
  duration,
  valueLabel,
}: StatCardProps) {
  const valueRef = useRef<HTMLParagraphElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(valueRef, { once: true, margin: "-10% 0px" });
  const { text } = useCountUp(countRef, value, {
    duration,
    enabled: animate && inView,
    format: (current) => `${prefix}${current.toFixed(decimals)}${suffix}`,
  });

  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? (
          <Icon className="size-4 shrink-0 text-coral" aria-hidden />
        ) : null}
      </CardHeader>
      <CardContent>
        <p
          ref={valueRef}
          className={cn(
            "font-sans text-display-sm font-semibold text-foreground",
            tabularImpact,
          )}
        >
          {valueLabel ?? (
            <span ref={countRef}>{text}</span>
          )}
        </p>
        {trend ? (
          <p className="mt-1 text-xs text-status-active">{trend}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
