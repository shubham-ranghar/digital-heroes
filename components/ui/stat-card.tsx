"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountUp } from "@/lib/motion";
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
}: StatCardProps) {
  const { formatted } = useCountUp(value, {
    decimals,
    enabled: animate,
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
          className={cn(
            "font-sans text-display-sm font-semibold text-foreground",
            tabularImpact,
          )}
        >
          {prefix}
          {formatted}
          {suffix}
        </p>
        {trend ? (
          <p className="mt-1 text-xs text-status-active">{trend}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
