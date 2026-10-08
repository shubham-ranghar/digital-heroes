"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-12">
      <ErrorPageState
        title="Dashboard unavailable"
        description="We could not load your dashboard. Check your connection and try again."
        onRetry={reset}
      />
    </div>
  );
}
