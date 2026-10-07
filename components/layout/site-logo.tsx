"use client";

import Link from "next/link";
import { useRef } from "react";

import { useNavTheme } from "@/hooks/use-nav-theme";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className }: SiteLogoProps) {
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const navTheme = useNavTheme(wordmarkRef);

  return (
    <Link
      href="/"
      className={cn("relative flex shrink-0 items-center", className)}
    >
      <span
        ref={wordmarkRef}
        className={cn(
          "inline-flex h-11 items-center whitespace-nowrap text-lg font-semibold tracking-tight motion-transition-colors duration-300",
          navTheme === "dark" ? "text-cream" : "text-navy",
        )}
      >
        digital<span className="text-coral">.HEROES</span>
      </span>
    </Link>
  );
}
