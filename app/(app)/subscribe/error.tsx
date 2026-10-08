"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function SubscribeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div data-tone="navy" className="section-navy flex min-h-[calc(100dvh-var(--header-height))] flex-1 items-center justify-center px-4 py-16 pt-[var(--header-height)]">
      <div className="mx-auto w-full max-w-lg">
        <ErrorPageState
          title="Subscribe unavailable"
          description={
            error.message ||
            "We could not load plans. Check your configuration and try again."
          }
          onRetry={reset}
        />
      </div>
    </div>
  );
}
