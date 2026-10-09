"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminWinnersTableProps = {
  /** One page of winners, already searched, filtered and sorted by the server. */
  winners: WinnerWithDraw[];
  table: AdminTableState;
  total: number;
};

export function AdminWinnersTable({ winners, table, total }: AdminWinnersTableProps) {
  const router = useRouter();
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
      router.refresh();
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
