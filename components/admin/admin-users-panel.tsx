"use client";

import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { TablePagination } from "@/components/admin/table-pagination";
import { useServerTable } from "@/components/admin/use-admin-table-url";
import { ADMIN_PAGE_SIZE, type AdminTableState } from "@/lib/admin/pagination";
import {
  editorialTableHead,
  editorialTableNumber,
} from "@/lib/typography-editorial";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUserRow } from "@/lib/admin/queries";
import {
  deleteAdminScoreAction,
  fetchAdminUserScoresAction,
  saveAdminScoreAction,
  updateAdminSubscriptionAction,
} from "@/lib/admin/users-actions";
import type { ScoreRow } from "@/lib/scores/types";
import { formatDateLabel } from "@/lib/dates";
import { todayIsoDate } from "@/lib/scores/dates";

type AdminUsersPanelProps = {
  /** One page of users, already searched, filtered and sorted by the server. */
  users: AdminUserRow[];
  table: AdminTableState;
  total: number;
};

const PLAN_ITEMS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const STATUS_ITEMS = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "lapsed", label: "Lapsed" },
  { value: "past_due", label: "Past due" },
];

export function AdminUsersPanel({ users, table, total }: AdminUsersPanelProps) {
  const { controls, hrefFor } = useServerTable(table);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [scoreToDelete, setScoreToDelete] = useState<ScoreRow | null>(null);

  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [subStatus, setSubStatus] = useState<
    "active" | "cancelled" | "lapsed" | "past_due"
  >("active");
  const [renewalDate, setRenewalDate] = useState("");

  const [scoreValue, setScoreValue] = useState("");
  const [playedOn, setPlayedOn] = useState(todayIsoDate());
  const [editingScoreId, setEditingScoreId] = useState<string | undefined>();
  const [manageTab, setManageTab] = useState<"subscription" | "scores">(
    "subscription",
  );

  function openUser(user: AdminUserRow) {
    setSelected(user);
    setManageTab("subscription");
    setPlan(user.plan ?? "monthly");
    setSubStatus(user.subscriptionStatus ?? "active");
    setRenewalDate(user.renewalDate ?? "");
    setScoreValue("");
    setPlayedOn(todayIsoDate());
    setEditingScoreId(undefined);
    setScores([]);
    startTransition(async () => {
      const result = await fetchAdminUserScoresAction(user.id);
      if (result.ok) {
        setScores(result.scores);
      } else {
        toast.error(result.message);
      }
    });
  }

  function saveSubscription() {
    if (!selected) {
      return;
    }
    startTransition(async () => {
      const result = await updateAdminSubscriptionAction({
        userId: selected.id,
        plan,
        status: subStatus,
        renewalDate,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  function saveScore() {
    if (!selected) {
      return;
    }
    startTransition(async () => {
      const result = await saveAdminScoreAction({
        userId: selected.id,
        scoreId: editingScoreId,
        score: scoreValue,
        playedOn,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      const refreshed = await fetchAdminUserScoresAction(selected.id);
      if (refreshed.ok) {
        setScores(refreshed.scores);
      }
      setScoreValue("");
      setPlayedOn(todayIsoDate());
      setEditingScoreId(undefined);
    });
  }

  function confirmDeleteScore() {
    if (!selected || !scoreToDelete) {
      return;
    }
    startTransition(async () => {
      const result = await deleteAdminScoreAction({
        userId: selected.id,
        scoreId: scoreToDelete.id,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setScoreToDelete(null);
      const refreshed = await fetchAdminUserScoresAction(selected.id);
      if (refreshed.ok) {
        setScores(refreshed.scores);
      }
    });
  }

  return (
    <>
      <SortableDataTable
        rows={users}
        getRowId={(row) => row.id}
        server={controls}
        footer={
          <TablePagination
            page={table.page}
            pageSize={ADMIN_PAGE_SIZE}
            total={total}
            noun={{ singular: "user", plural: "users" }}
            hrefForPage={(page) => hrefFor({ page })}
          />
        }
        emptyMessage="No users yet. Members appear here as soon as they sign up."
        searchText={(row) => `${row.email ?? ""} ${row.displayName ?? ""}`}
        searchPlaceholder="Search by email or name"
        filterGroups={[
          {
            id: "role",
            label: "Role",
            options: [
              { value: "subscriber", label: "Subscribers" },
              { value: "admin", label: "Admins" },
            ],
          },
          {
            id: "access",
            label: "Access",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
        columns={[
          {
            id: "email",
            header: "Email",
            sortable: true,
            sortValue: (row) => row.email ?? "",
            cell: (row) => (
              <span className="max-w-[200px] truncate block">
                {row.email ?? "—"}
              </span>
            ),
          },
          {
            id: "name",
            header: "Name",
            sortable: true,
            sortValue: (row) => row.displayName ?? "",
            cell: (row) => row.displayName ?? "—",
          },
          {
            id: "role",
            header: "Role",
            sortable: true,
            sortValue: (row) => row.role,
            cell: (row) => <StatusPill value={row.role} />,
          },
          {
            id: "access",
            header: "Access",
            sortable: true,
            sortValue: (row) => (row.hasAccess ? 1 : 0),
            cell: (row) => (
              <span className="max-w-[14rem] text-sm text-navy">{row.accessLabel}</span>
            ),
          },
          {
            id: "plan",
            header: "Plan",
            sortable: true,
            sortValue: (row) => row.plan ?? "",
            cell: (row) => row.plan ?? "—",
          },
          {
            id: "scores",
            header: "Scores",
            sortable: true,
            sortValue: (row) => row.scoreCount,
            cell: (row) => row.scoreCount,
            numeric: true,
          },
          {
            id: "actions",
            header: "",
            className: "!whitespace-normal",
            // A text link per row keeps the table quiet; solid/bordered
            // buttons are reserved for the page's primary actions.
            cell: (row) => (
              <Button type="button" size="sm" variant="link" onClick={() => openUser(row)}>
                Manage
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="top-[max(1rem,env(safe-area-inset-top))] translate-x-[-50%] translate-y-0 sm:max-w-lg"
        >
          {selected ? (
            <>
              <DialogHeader className="shrink-0 gap-1 text-left">
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <DialogTitle className="text-base">
                    {selected.displayName?.trim() || "Member"}
                  </DialogTitle>
                  <StatusPill value={selected.role} />
                </div>
                <DialogDescription className="text-left">
                  {selected.email ?? "No email on file"}
                </DialogDescription>
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1 text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(selected.id)
                      .then(() => toast.success("Member ID copied."))
                      .catch(() => toast.error("Could not copy the ID."));
                  }}
                >
                  <Copy className="size-3" aria-hidden />
                  Copy ID
                </button>
              </DialogHeader>

              <Tabs
                value={manageTab}
                onValueChange={(value) =>
                  value &&
                  setManageTab(value as "subscription" | "scores")
                }
                className="min-h-0 flex-1 gap-3"
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-0.5 p-1">
                  <TabsTrigger
                    value="subscription"
                    className="px-2 py-1.5 text-xs sm:text-sm"
                  >
                    Plan
                  </TabsTrigger>
                  <TabsTrigger value="scores" className="px-2 py-1.5 text-xs sm:text-sm">
                    Scores ({scores.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subscription" className="space-y-3 pt-0">
                  <p className="rounded-xl bg-sand px-3 py-2 text-xs text-navy">
                    Changes here update this site only, not Razorpay billing. Use
                    them to fix a payment that didn&apos;t sync. To stop charges,
                    cancel in the Razorpay dashboard.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Plan</span>
                      <Select
                        items={PLAN_ITEMS}
                        value={plan}
                        onValueChange={(v) => v && setPlan(v as "monthly" | "yearly")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Status</span>
                      <Select
                        items={STATUS_ITEMS}
                        value={subStatus}
                        onValueChange={(v) =>
                          v &&
                            setSubStatus(
                              v as "active" | "cancelled" | "lapsed" | "past_due",
                            )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="lapsed">Lapsed</SelectItem>
                          <SelectItem value="past_due">Past due</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Renewal date
                    </span>
                    <Input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isPending}
                    onClick={saveSubscription}
                  >
                    Save subscription
                  </Button>
                </TabsContent>

                <TabsContent value="scores" className="flex min-h-0 flex-col gap-3 pt-0">
                  <div className="rounded-xl border border-line bg-sand/30 p-3 space-y-3">
                    <p className="text-xs font-medium text-navy">
                      {editingScoreId ? "Edit score" : "Add score"}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,5rem)_1fr]">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Pts</span>
                        <Input
                          type="number"
                          min={1}
                          max={45}
                          placeholder="1–45"
                          value={scoreValue}
                          onChange={(e) => setScoreValue(e.target.value)}
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Played on</span>
                        <Input
                          type="date"
                          value={playedOn}
                          onChange={(e) => setPlayedOn(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" disabled={isPending} onClick={saveScore}>
                        {editingScoreId ? "Update score" : "Add score"}
                      </Button>
                      {editingScoreId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => {
                            setEditingScoreId(undefined);
                            setScoreValue("");
                            setPlayedOn(todayIsoDate());
                          }}
                        >
                          Cancel edit
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-h-0 min-w-0 flex-1 overflow-x-auto rounded-xl border border-line">
                    {scores.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No scores yet.
                      </p>
                    ) : (
                      <div className="max-h-[min(40dvh,16rem)] overflow-y-auto overscroll-contain">
                        <table className="w-full text-sm">
                          <thead
                            className={`sticky top-0 bg-surface text-left text-navy/70 ${editorialTableHead}`}
                          >
                            <tr className="border-b border-line">
                              <th className="px-3 py-2 font-normal">Date</th>
                              <th className="px-3 py-2 font-normal">Points</th>
                              <th className="px-3 py-2 text-right font-normal">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scores.map((score) => (
                              <tr
                                key={score.id}
                                className="border-b border-line/60 last:border-0"
                              >
                                <td className="px-3 py-2 whitespace-nowrap text-navy">
                                  {formatDateLabel(score.played_on)}
                                </td>
                                <td className={`px-3 py-2 ${editorialTableNumber}`}>
                                  {score.score}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      type="button"
                                      size="xs"
                                      variant="secondary"
                                      onClick={() => {
                                        setEditingScoreId(score.id);
                                        setScoreValue(String(score.score));
                                        setPlayedOn(score.played_on);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="xs"
                                      variant="ghost"
                                      onClick={() => setScoreToDelete(score)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(scoreToDelete)}
        onOpenChange={(open) => !open && setScoreToDelete(null)}
        title="Delete score?"
        description="This removes the member's score for that date. This cannot be undone."
        confirmLabel="Delete score"
        pending={isPending}
        onConfirm={confirmDeleteScore}
      />
    </>
  );
}
