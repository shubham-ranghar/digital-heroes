"use client";

import type { ReactNode } from "react";

import { editorialDisplay } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type HighlightHeadlineProps = {
  className?: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

/** Wrap apricot + Austin italic segments in children with <em>. */
export function HighlightHeadline({
  className,
  tone = "dark",
  children,
}: HighlightHeadlineProps) {
  return (
    <h1
      className={cn(
        editorialDisplay,
        tone === "dark" ? "text-cream" : "text-navy",
        "[&_em]:font-serif [&_em]:italic [&_em]:text-coral [&_em]:not-italic:font-serif",
        className,
      )}
    >
      {children}
    </h1>
  );
}
