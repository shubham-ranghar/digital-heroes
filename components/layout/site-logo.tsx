import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  /** Sets the wordmark colour (defaults to navy); the accent stays coral. */
  className?: string;
};

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn("relative flex shrink-0 items-center text-navy", className)}
    >
      <span className="inline-flex h-11 items-center whitespace-nowrap text-lg font-semibold tracking-tight">
        digital<span className="text-coral">.HEROES</span>
      </span>
    </Link>
  );
}
