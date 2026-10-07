"use client";

import { Button } from "@/components/ui/button";

type ScoresLoadErrorProps = {
  message: string;
};

export function ScoresLoadError({ message }: ScoresLoadErrorProps) {
  return (
    <div
      className="rounded-xl border border-status-danger/40 bg-status-danger/10 px-4 py-4 text-sm text-navy"
      role="alert"
    >
      <p className="font-medium">Could not load your scores</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>
    </div>
  );
}
