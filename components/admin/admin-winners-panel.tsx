"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormError } from "@/components/auth/form-message";
import { WinnerProofPreview } from "@/components/winners/winner-proof-preview";
import {
  approveWinnerAction,
  markWinnerPaidAction,
  rejectWinnerAction,
} from "@/lib/winners/admin-actions";
import { formatCurrency } from "@/lib/money";
import type { WinnerWithDraw } from "@/lib/winners/types";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tabularImpact } from "@/lib/typography";

type AdminWinnersPanelProps = {
  winners: WinnerWithDraw[];
};

export function AdminWinnersPanel({ winners }: AdminWinnersPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    action: (input: unknown) => Promise<{ ok: boolean; message: string }>,
    winnerId: string,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action({ winnerId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  if (winners.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No winner records yet. Publish a draw to create prize claims.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <FormError message={error} />
      <ul className="space-y-6">
        {winners.map((winner) => (
          <li
            key={winner.id}
            className="rounded-[20px] border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-lg text-navy">
                  Tier {winner.tier} · Draw {winner.draw_month}
                </p>
                <p className={tabularImpact}>
                  <span className="text-coral">
                    {formatCurrency(winner.prize_amount)}
                  </span>
                  <span className="text-slate text-sm">
                    {" "}
                    · Member {winner.user_id.slice(0, 8)}…
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{winner.verification}</Badge>
                <StatusPill value={winner.payment} />
              </div>
            </div>

            <div className="mt-4 max-w-md">
              <WinnerProofPreview
                winnerId={winner.id}
                hasProof={Boolean(winner.proof_url)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isPending || winner.verification === "approved"}
                onClick={() => runAction(approveWinnerAction, winner.id)}
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending || winner.verification === "rejected"}
                onClick={() => runAction(rejectWinnerAction, winner.id)}
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  isPending ||
                  winner.verification !== "approved" ||
                  winner.payment === "paid"
                }
                onClick={() => runAction(markWinnerPaidAction, winner.id)}
              >
                Mark as paid
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
