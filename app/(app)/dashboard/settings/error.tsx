"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <ErrorPageState
        title="Could not load settings"
        description="Your account settings are temporarily unavailable. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
