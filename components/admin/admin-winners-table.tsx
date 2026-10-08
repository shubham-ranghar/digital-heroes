"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { WinnerProofPreview } from "@/components/winners/winner-proof-preview";
import {
  approveWinnerAction,
  markWinnerPaidAction,
  rejectWinnerAction,
} from "@/lib/winners/admin-actions";
import { formatCurrency } from "@/lib/money";
import type { WinnerWithDraw } from "@/lib/winners/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminWinnersTableProps = {
  winners: WinnerWithDraw[];
};

export function AdminWinnersTable({ winners }: AdminWinnersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewWinner, setPreviewWinner] = useState<WinnerWithDraw | null>(null);

  function runAction(
    action: (input: unknown) => Promise<{ ok: boolean; message: string }>,
    winnerId: string,
  ) {
    startTransition(async () => {
      const result = await action({ winnerId });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <SortableDataTable
        rows={winners}
        getRowId={(row) => row.id}
        emptyMessage="No winners yet. Publish a draw to create prize records."
        columns={[
          {
            id: "draw",
            header: "Draw",
            sortable: true,
            sortValue: (row) => row.draw_month,
            cell: (row) => row.draw_month,
          },
          {
            id: "tier",
            header: "Tier",
            sortable: true,
            sortValue: (row) => row.tier,
            cell: (row) => row.tier,
          },
          {
            id: "amount",
            header: "Prize",
            sortable: true,
            sortValue: (row) => row.prize_amount,
            cell: (row) => formatCurrency(row.prize_amount),
          },
          {
            id: "member",
            header: "Member",
            sortable: true,
            sortValue: (row) => row.user_id,
            cell: (row) => `${row.user_id.slice(0, 8)}…`,
          },
          {
            id: "verification",
            header: "Verification",
            sortable: true,
            sortValue: (row) => row.verification,
            cell: (row) => <StatusPill value={row.verification} />,
          },
          {
            id: "payment",
            header: "Payment",
            sortable: true,
            sortValue: (row) => row.payment,
            cell: (row) => <StatusPill value={row.payment} />,
          },
          {
            id: "proof",
            header: "Proof",
            cell: (row) => (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!row.proof_url}
                onClick={() => setPreviewWinner(row)}
              >
                Preview
              </Button>
            ),
          },
          {
            id: "actions",
            header: "Actions",
            className: "!whitespace-normal",
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || row.verification === "approved"}
                  onClick={() => runAction(approveWinnerAction, row.id)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isPending || row.verification === "rejected"}
                  onClick={() => runAction(rejectWinnerAction, row.id)}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={
                    isPending ||
                    row.verification !== "approved" ||
                    row.payment === "paid"
                  }
                  onClick={() => runAction(markWinnerPaidAction, row.id)}
                >
                  Paid
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={Boolean(previewWinner)}
        onOpenChange={(open) => !open && setPreviewWinner(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Proof preview</DialogTitle>
          </DialogHeader>
          {previewWinner ? (
            <WinnerProofPreview
              winnerId={previewWinner.id}
              hasProof={Boolean(previewWinner.proof_url)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
