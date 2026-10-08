"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError, FormSuccess } from "@/components/auth/form-message";
import { uploadWinnerProofAction } from "@/lib/winners/actions";
import { Button } from "@/components/ui/button";
import type { WinnerWithDraw } from "@/lib/winners/types";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { WinnerProofPreview } from "@/components/winners/winner-proof-preview";

type WinnerProofUploadProps = {
  winner: WinnerWithDraw;
};

export function WinnerProofUpload({ winner }: WinnerProofUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canUpload =
    winner.verification === "pending" || winner.verification === "rejected";

  function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }

    const formData = new FormData();
    formData.set("winnerId", winner.id);
    formData.set("file", file);

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await uploadWinnerProofAction(formData);
      if (result.ok) {
        const text = result.message ?? "Proof uploaded — awaiting admin review.";
        setMessage(text);
        toast.success(text);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        router.refresh();
        return;
      }
      toast.error(result.message);
      setError(result.message);
    });
  }

  return (
    <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-sans text-lg text-navy">
            {winner.tier}-match tier
          </p>
          <p className={tabularImpact}>
            <span className="text-coral">{formatCurrency(winner.prize_amount)}</span>
            <span className="text-slate"> · Draw {winner.draw_month}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{winner.verification}</Badge>
          <StatusPill value={winner.payment} />
        </div>
      </div>

      <WinnerProofPreview winnerId={winner.id} hasProof={Boolean(winner.proof_url)} />

      <FormSuccess message={message} />
      <FormError message={error} />

      {canUpload ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm text-slate file:mr-3 file:rounded-full file:border-0 file:bg-coral file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy file:transition-colors file:duration-200 hover:file:bg-coral-deep"
            disabled={isPending}
          />
          <Button
            type="button"
            className="w-full sm:w-auto"
            loading={isPending}
            onClick={handleUpload}
          >
            {isPending ? "Uploading…" : "Upload screenshot"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate">
          {winner.verification === "approved"
            ? "Proof approved. Payment will be processed by the team."
            : "This claim is closed."}
        </p>
      )}
    </div>
  );
}
