"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function WinnersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-cream flex flex-1 items-center justify-center px-4 py-16 pt-[var(--header-height)]">
      <ErrorPageState
        title="Could not load winners"
        description="The winners list is temporarily unavailable."
        onRetry={reset}
      />
    </div>
  );
}
