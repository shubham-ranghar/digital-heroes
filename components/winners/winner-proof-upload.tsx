"use client";

import { ImageUp } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError, FormSuccess } from "@/components/auth/form-message";
import { uploadWinnerProofAction } from "@/lib/winners/actions";
import { PROOF_ALLOWED_MIME, PROOF_MAX_BYTES } from "@/lib/winners/constants";
import { Button } from "@/components/ui/button";
import type { WinnerWithDraw } from "@/lib/winners/types";
import { formatCurrency } from "@/lib/money";
import { editorialKeyNumber } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";
import { WinnerProofPreview } from "@/components/winners/winner-proof-preview";

type ClaimTone = "active" | "pending" | "danger";

const CLAIM_DOT: Record<ClaimTone, string> = {
  active: "bg-status-active",
  pending: "bg-status-pending",
  danger: "bg-status-danger",
};

/** One plain-language line for where the claim stands (verification + payment). */
function claimStatus(winner: WinnerWithDraw): { label: string; tone: ClaimTone } {
  if (winner.verification === "rejected") {
    return { label: "Proof rejected — upload a new screenshot", tone: "danger" };
  }
  if (winner.verification === "approved") {
    return winner.payment === "paid"
      ? { label: "Paid", tone: "active" }
      : { label: "Approved — payout on the way", tone: "active" };
  }
  return winner.proof_url
    ? { label: "Proof under review", tone: "pending" }
    : { label: "Upload proof to claim your prize", tone: "pending" };
}

type WinnerProofUploadProps = {
  winner: WinnerWithDraw;
  /** Proof preview URL signed during the page render. */
  proofSignedUrl?: string;
  /** `navy` for the page's emphasis claim (the most recent). */
  tone?: "light" | "navy";
};

export function WinnerProofUpload({
  winner,
  proofSignedUrl,
  tone = "light",
}: WinnerProofUploadProps) {
  const navy = tone === "navy";
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const claim = claimStatus(winner);
  const canUpload =
    winner.verification === "pending" || winner.verification === "rejected";

  function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }
    // Checked here too: an oversized body is rejected before the action runs,
    // so the server's own message would never arrive.
    if (file.size > PROOF_MAX_BYTES) {
      setError("Image must be 4MB or smaller. Crop it or save it as JPEG.");
      return;
    }
    if (!PROOF_ALLOWED_MIME.has(file.type)) {
      setError("Use a PNG, JPEG, or WebP screenshot.");
      return;
    }

    const formData = new FormData();
    formData.set("winnerId", winner.id);
    formData.set("file", file);

    setError(null);
    setMessage(null);

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof uploadWinnerProofAction>>;
      try {
        result = await uploadWinnerProofAction(formData);
      } catch {
        result = { ok: false, message: "Upload failed. Check your connection and try again." };
      }
      if (result.ok) {
        const text = result.message ?? "Proof uploaded — awaiting admin review.";
        setMessage(text);
        toast.success(text);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        setFileName(null);
        return;
      }
      toast.error(result.message);
      setError(result.message);
    });
  }

  return (
    <div
      data-nav-theme={navy ? "dark" : undefined}
      className={cn(
        "space-y-4 rounded-[20px] border p-5",
        navy ? "section-navy border-navy bg-navy" : "border-line bg-surface",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={cn("font-sans text-lg", navy ? "text-cream" : "text-navy")}>
            {winner.tier}-match tier
          </p>
          <p className="mt-1">
            <span className={cn("text-3xl", editorialKeyNumber)}>
              {formatCurrency(winner.prize_amount)}
            </span>
            <span className={navy ? "text-cream/75" : "text-slate"}>
              {" "}
              · Draw {winner.draw_month}
            </span>
          </p>
        </div>
        <p
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            navy ? "bg-cream/10 text-cream" : "bg-sand text-navy",
          )}
        >
          <span
            className={cn("size-2 shrink-0 rounded-full", CLAIM_DOT[claim.tone])}
            aria-hidden
          />
          {claim.label}
        </p>
      </div>

      {/* Keyed by path so a replaced screenshot fetches a fresh signed URL. */}
      <WinnerProofPreview
        key={winner.proof_url ?? "none"}
        winnerId={winner.id}
        hasProof={Boolean(winner.proof_url)}
        signedUrl={proofSignedUrl}
        messageClassName={navy ? "text-cream/75" : undefined}
      />

      <FormSuccess message={message} className={navy ? "text-cream" : undefined} />
      <FormError
        message={error}
        className={navy ? "bg-status-danger/25 text-cream" : undefined}
      />

      {canUpload ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? null);
              setError(null);
            }}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full border border-dashed px-4 py-2.5 text-sm transition-colors duration-200 focus-within:ring-2 focus-within:ring-coral",
              navy
                ? "border-cream/30 text-cream/80 hover:border-cream/60"
                : "border-line text-slate hover:border-navy/40",
              isPending && "pointer-events-none opacity-60",
            )}
          >
            <ImageUp className="size-4 shrink-0" aria-hidden />
            <span className="truncate">
              {fileName ?? "Choose a PNG, JPEG or WebP screenshot (max 4MB)"}
            </span>
          </label>
          <Button
            type="button"
            className="w-full sm:w-auto"
            loading={isPending}
            disabled={!fileName}
            onClick={handleUpload}
          >
            {isPending ? "Uploading…" : "Upload screenshot"}
          </Button>
        </div>
      ) : (
        <p className={cn("text-sm", navy ? "text-cream/75" : "text-slate")}>
          {winner.verification === "approved"
            ? "Proof approved. Payment will be processed by the team."
            : "This claim is closed."}
        </p>
      )}
    </div>
  );
}
