import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  variant: "cream" | "navy";
  className?: string;
  children: ReactNode;
  id?: string;
};

/** Alternating marketing surface with scoped CSS variables. */
export function MarketingSection({
  variant,
  className,
  children,
  id,
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      data-tone={variant}
      data-nav-theme={variant === "cream" ? "light" : "dark"}
      className={cn(
        variant === "cream" ? "section-cream" : "section-navy",
        "px-4 py-16 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
