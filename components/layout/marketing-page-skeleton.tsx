import type { ReactNode } from "react";

import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading frame for cream marketing pages: the same shell (header offset,
 * tone) and section padding as the page, plus its section heading, so the
 * content streams in without shifting what the route wipe revealed.
 */
export function MarketingPageSkeleton({ children }: { children?: ReactNode }) {
  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <div aria-busy="true" aria-label="Loading">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="mb-4 h-10 w-72 max-w-full" />
          <Skeleton className="mb-10 h-5 w-full max-w-xl" />
          {children}
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
