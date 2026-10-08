"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function CharitiesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-cream px-4 py-16">
      <div className="mx-auto max-w-lg">
        <ErrorPageState
          title="Could not load charities"
          description="Partner charities are temporarily unavailable. Please try again."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
