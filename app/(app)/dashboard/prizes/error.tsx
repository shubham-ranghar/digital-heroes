"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function PrizesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-12">
      <ErrorPageState
        title="Prize claims unavailable"
        description="We could not load your wins. Try again or contact support if this persists."
        onRetry={reset}
      />
    </div>
  );
}
