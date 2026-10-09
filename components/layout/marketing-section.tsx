import type { ReactNode } from "react";

import { ScrollFade } from "@/components/motion/scroll-fade";
import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  variant: "cream" | "navy";
  className?: string;
  children: ReactNode;
  id?: string;
  /**
   * Scroll-linked opacity on the section's content (one unit per section).
   * Switch off for a page's lead/hero section (LCP) and for sections whose
   * job is a form.
   */
  fade?: boolean;
};

/** Alternating marketing surface with scoped CSS variables. */
export function MarketingSection({
  variant,
  className,
  children,
  id,
  fade = true,
}: MarketingSectionProps) {
  const content = <div className="mx-auto w-full max-w-6xl">{children}</div>;

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
      {fade ? <ScrollFade>{content}</ScrollFade> : content}
    </section>
  );
}
