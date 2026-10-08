"use client";

import Link from "next/link";

import { ErrorPageState } from "@/components/ui/page-state";
import { Button } from "@/components/ui/button";

export default function CharityDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-cream px-4 py-16">
      <div className="mx-auto max-w-lg">
        <ErrorPageState
          title="Could not load this charity"
          description="This partner page is temporarily unavailable. Try again or browse all causes."
          onRetry={reset}
        />
        <div className="mt-4 text-center">
          <Button variant="secondary" size="sm" render={<Link href="/charities" />}>
            All charities
          </Button>
        </div>
      </div>
    </div>
  );
}
