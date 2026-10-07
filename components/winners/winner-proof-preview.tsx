"use client";

import { useEffect, useState } from "react";

import { getWinnerProofSignedUrlAction } from "@/lib/winners/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WinnerProofPreviewProps = {
  winnerId: string;
  hasProof: boolean;
  className?: string;
};

export function WinnerProofPreview({
  winnerId,
  hasProof,
  className,
}: WinnerProofPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasProof) {
      return;
    }

    let cancelled = false;
    void getWinnerProofSignedUrlAction(winnerId).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok && result.signedUrl) {
        setUrl(result.signedUrl);
      } else {
        setError(result.ok ? "Preview unavailable." : result.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [winnerId, hasProof]);

  if (!hasProof) {
    return (
      <p className="text-xs text-slate">No screenshot uploaded yet.</p>
    );
  }

  if (error) {
    return <p className="text-xs text-status-danger">{error}</p>;
  }

  if (!url) {
    return <Skeleton className={cn("h-32 w-full rounded-xl", className)} />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block overflow-hidden rounded-xl border border-line", className)}
    >
      <img
        src={url}
        alt="Winner proof screenshot"
        className="max-h-48 w-full object-contain bg-surface"
      />
    </a>
  );
}
