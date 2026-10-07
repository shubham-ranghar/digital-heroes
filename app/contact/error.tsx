"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function ContactError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-cream flex flex-1 items-center justify-center px-4 py-16 pt-[var(--header-height)]">
      <ErrorPageState
        title="Contact form unavailable"
        description="Please try again in a moment."
        onRetry={reset}
      />
    </div>
  );
}
