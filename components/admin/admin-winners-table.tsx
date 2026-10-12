"use client";

import { Check, Eye, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MemberLabel } from "@/components/admin/member-label";
import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { TablePagination } from "@/components/admin/table-pagination";
import { useServerTable } from "@/components/admin/use-admin-table-url";
import { ADMIN_PAGE_SIZE, type AdminTableState } from "@/lib/admin/pagination";
import { WinnerProofPreview } from "@/components/winners/winner-proof-preview";
import {
  approveWinnerAction,
  markWinnerPaidAction,
  rejectWinnerAction,
} from "@/lib/winners/admin-actions";
import { formatMonthLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import type { WinnerWithDraw } from "@/lib/winners/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Compact row actions. Every enabled action has a visible border so it reads
 * as a button; disabled ones fade to an outline instead of the global filled
 * muted surface, which in a dense row looked more clickable than the live ones.
 */
const rowAction =
  "h-8 min-h-8 gap-1.5 px-3 text-xs disabled:not-aria-busy:border-line disabled:not-aria-busy:bg-transparent disabled:not-aria-busy:text-muted-foreground disabled:not-aria-busy:opacity-60";

type AdminWinnersTableProps = {
  /** One page of winners, already searched, filtered and sorted by the server. */
  winners: WinnerWithDraw[];
  table: AdminTableState;
  total: number;
};

export function AdminWinnersTable({ winners, table, total }: AdminWinnersTableProps) {
  const { controls, hrefFor } = useServerTable(table);
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
    });
  }

  return (
    <>
      <SortableDataTable
        rows={winners}
        getRowId={(row) => row.id}
        server={controls}
        footer={
          <TablePagination
            page={table.page}
            pageSize={ADMIN_PAGE_SIZE}
            total={total}
            noun={{ singular: "winner", plural: "winners" }}
            hrefForPage={(page) => hrefFor({ page })}
          />
        }
        emptyMessage="No winners yet. Publish a draw to create prize records."
        emptyAction={
          <Button size="sm" variant="secondary" render={<Link href="/admin/draws" />}>
            Go to draws
          </Button>
        }
        searchText={(row) =>
          `${row.member_name ?? ""} ${row.member_email ?? ""} ${row.user_id} ${row.draw_month}`
        }
        searchPlaceholder="Name, email or month (2026-09)"
        filterGroups={[
          {
            id: "verification",
            label: "Verification",
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            id: "payment",
            label: "Payment",
            options: [
              { value: "pending", label: "Unpaid" },
              { value: "paid", label: "Paid" },
            ],
          },
        ]}
        columns={[
          {
            id: "draw",
            header: "Draw",
            sortable: true,
            sortValue: (row) => row.draw_month,
            cell: (row) => formatMonthLabel(row.draw_month),
          },
          {
            id: "tier",
            header: "Tier",
            sortable: true,
            sortValue: (row) => row.tier,
            cell: (row) => row.tier,
            numeric: true,
          },
          {
            id: "amount",
            header: "Prize",
            sortable: true,
            sortValue: (row) => row.prize_amount,
            cell: (row) => formatCurrency(row.prize_amount),
            numeric: true,
          },
          {
            id: "member",
            header: "Member",
            sortable: true,
            sortValue: (row) => row.member_name ?? row.member_email ?? row.user_id,
            cell: (row) => (
              <MemberLabel
                userId={row.user_id}
                name={row.member_name}
                email={row.member_email}
              />
            ),
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
            cell: (row) =>
              row.proof_url ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className={cn(rowAction, "border-line hover:border-navy")}
                  onClick={() => setPreviewWinner(row)}
                >
                  <Eye aria-hidden />
                  Preview
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No proof yet</span>
              ),
          },
          {
            id: "actions",
            header: "Actions",
            className: "!whitespace-normal",
            cell: (row) => (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  className={rowAction}
                  disabled={isPending || row.verification === "approved"}
                  onClick={() => runAction(approveWinnerAction, row.id)}
                >
                  <Check aria-hidden />
                  Approve
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className={cn(
                    rowAction,
                    "border-status-danger/40 text-status-danger hover:border-status-danger hover:bg-status-danger/10",
                  )}
                  disabled={isPending || row.verification === "rejected"}
                  onClick={() => runAction(rejectWinnerAction, row.id)}
                >
                  <X aria-hidden />
                  Reject
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className={cn(rowAction, "hover:bg-navy hover:text-cream")}
                  disabled={
                    isPending ||
                    row.verification !== "approved" ||
                    row.payment === "paid"
                  }
                  onClick={() => runAction(markWinnerPaidAction, row.id)}
                >
                  <Wallet aria-hidden />
                  Mark paid
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
