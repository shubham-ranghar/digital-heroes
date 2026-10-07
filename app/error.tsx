"use client";

import { useEffect } from "react";

import { ErrorPageState } from "@/components/ui/page-state";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section-navy flex flex-1 items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-lg">
        <ErrorPageState
          title="Unexpected error"
          description="Something broke while loading this page. You can try again or return home."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
