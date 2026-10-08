import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  children: ReactNode;
  variant?: "cream" | "navy";
  className?: string;
  /** When false, skip top padding (e.g. full-bleed hero handles offset). */
  padForHeader?: boolean;
};

export function MarketingPageShell({
  children,
  variant = "cream",
  className,
  padForHeader = true,
}: MarketingPageShellProps) {
  return (
    <div
      data-tone={variant}
      data-nav-theme={variant === "cream" ? "light" : "dark"}
      className={cn(
        variant === "cream" ? "section-cream" : "section-navy",
        "flex min-w-0 flex-1 flex-col",
        padForHeader && "pt-[var(--header-height)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
