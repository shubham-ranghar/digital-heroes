"use client";

import type { ReactNode } from "react";

import { editorialDisplay } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type HighlightHeadlineProps = {
  className?: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

/** Hero display; an <em> child takes the accent voice (Austin italic, coral). */
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
        "[&_em]:text-coral",
        className,
      )}
    >
      {children}
    </h1>
  );
}
