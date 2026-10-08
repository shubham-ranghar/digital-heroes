import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BentoCardProps = {
  title: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  icon?: LucideIcon;
  /** Primary panel: raised shadow and a coral accent rule. */
  emphasis?: boolean;
};

export function BentoCard({
  title,
  className,
  headerAction,
  children,
  icon: Icon,
  emphasis = false,
}: BentoCardProps) {
  return (
    <Card
      interactive={false}
      className={cn(
        "relative h-full border-line bg-surface",
        emphasis && "shadow-[var(--shadow-raised)]",
        className,
      )}
    >
      {emphasis ? (
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-coral via-coral/60 to-transparent"
          aria-hidden
        />
      ) : null}
      <CardHeader className="flex flex-col items-stretch gap-3 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2.5 text-base font-sans text-navy">
          {Icon ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-coral/12 text-coral">
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
          {title}
        </CardTitle>
        {headerAction ? (
          <div className="flex shrink-0 flex-wrap gap-2">{headerAction}</div>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
