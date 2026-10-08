import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** `navy` when rendered inside a navy surface. */
  tone?: "light" | "navy";
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = "light",
}: DashboardEmptyStateProps) {
  const navy = tone === "navy";

  return (
    <div
      className={cn(
        "group/empty flex flex-col items-center justify-center rounded-[20px] border border-dashed px-6 py-10 text-center",
        navy ? "border-cream/25 bg-cream/5" : "border-line bg-sand/40",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-coral/15 text-coral ring-8 ring-coral/5 transition-transform duration-500 ease-[var(--ease-out)] group-hover/empty:-translate-y-0.5 motion-reduce:transform-none">
        <Icon className="size-6" aria-hidden />
      </div>
      <p className={cn("font-sans text-lg", navy ? "text-cream" : "text-navy")}>
        {title}
      </p>
      <p
        className={cn(
          "mt-2 max-w-sm text-sm",
          navy ? "text-cream/75" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
