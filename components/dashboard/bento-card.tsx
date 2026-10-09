import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorialCard } from "@/components/ui/editorial-card";
import { cn } from "@/lib/utils";

type BentoCardProps = {
  title: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  icon?: LucideIcon;
  /** Primary panel: raised shadow and a coral accent rule. */
  emphasis?: boolean;
  /** `navy`: the page's single dark emphasis surface. */
  tone?: "light" | "navy";
};

export function BentoCard({
  title,
  className,
  headerAction,
  children,
  icon: Icon,
  emphasis = false,
  tone = "light",
}: BentoCardProps) {
  const navy = tone === "navy";

  return (
    // The corner clip-path would cut a box-shadow, so the shadow lives on this
    // wrapper as a drop-shadow, matching the prize tier cards.
    <div
      className={cn(
        "h-full",
        emphasis || navy
          ? "drop-shadow-[0_8px_20px_rgba(20,33,61,0.12)]"
          : "drop-shadow-[0_4px_12px_rgba(20,33,61,0.08)]",
      )}
    >
      <EditorialCard
        borderClassName={cn("h-full rounded-[20px]", navy ? "bg-navy" : "bg-line")}
        className="rounded-[19px]"
      >
        <Card
          interactive={false}
          data-nav-theme={navy ? "dark" : undefined}
          className={cn(
            "relative h-full rounded-[19px] border-0 shadow-none",
            navy ? "section-navy" : "bg-surface",
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
            <CardTitle
              className={cn(
                "flex items-center gap-2.5 text-base font-sans",
                navy ? "text-cream" : "text-navy",
              )}
            >
              {Icon ? (
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-coral",
                    navy ? "bg-coral/20" : "bg-coral/12",
                  )}
                >
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
      </EditorialCard>
    </div>
  );
}
