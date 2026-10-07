"use client";

import { ErrorPageState } from "@/components/ui/page-state";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-12">
      <ErrorPageState
        title="Admin error"
        description="This admin view failed to load. Confirm your service role key and database connection."
        onRetry={reset}
      />
    </div>
  );
}
