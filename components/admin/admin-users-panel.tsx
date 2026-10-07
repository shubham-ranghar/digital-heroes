"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  updateAdminProfileAction,
  updateAdminSubscriptionAction,
} from "@/lib/admin/users-actions";
import type { ScoreRow } from "@/lib/scores/types";
import { todayIsoDate } from "@/lib/scores/dates";

type AdminUsersPanelProps = {
  users: AdminUserRow[];
};

export function AdminUsersPanel({ users }: AdminUsersPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [scoreToDelete, setScoreToDelete] = useState<ScoreRow | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"subscriber" | "admin">("subscriber");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [subStatus, setSubStatus] = useState<"active" | "cancelled" | "lapsed">(
    "active",
  );
  const [renewalDate, setRenewalDate] = useState("");

  const [scoreValue, setScoreValue] = useState("");
  const [playedOn, setPlayedOn] = useState(todayIsoDate());
  const [editingScoreId, setEditingScoreId] = useState<string | undefined>();

  function openUser(user: AdminUserRow) {
    setSelected(user);
    setDisplayName(user.displayName ?? "");
    setRole(user.role);
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

  function saveProfile() {
    if (!selected) {
      return;
    }
    startTransition(async () => {
      const result = await updateAdminProfileAction({
        userId: selected.id,
        displayName,
        role,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
    });
  }

  return (
    <>
      <SortableDataTable
        rows={users}
        getRowId={(row) => row.id}
        emptyMessage="No users found."
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
              <StatusPill value={row.hasAccess ? "active" : "lapsed"} />
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
          },
          {
            id: "actions",
            header: "",
            cell: (row) => (
              <Button type="button" size="sm" variant="secondary" onClick={() => openUser(row)}>
                Manage
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage member</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground break-all">{selected.id}</p>

              <section className="space-y-3">
                <h3 className="text-sm font-medium text-navy">Profile</h3>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                />
                <Select
                  value={role}
                  onValueChange={(v) => v && setRole(v as "subscriber" | "admin")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscriber">Subscriber</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" disabled={isPending} onClick={saveProfile}>
                  Save profile
                </Button>
              </section>

              <section className="space-y-3 border-t border-line pt-4">
                <h3 className="text-sm font-medium text-navy">Subscription</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    value={plan}
                    onValueChange={(v) => v && setPlan(v as "monthly" | "yearly")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={subStatus}
                    onValueChange={(v) =>
                      v && setSubStatus(v as "active" | "cancelled" | "lapsed")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="lapsed">Lapsed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                />
                <Button type="button" size="sm" disabled={isPending} onClick={saveSubscription}>
                  Save subscription
                </Button>
              </section>

              <section className="space-y-3 border-t border-line pt-4">
                <h3 className="text-sm font-medium text-navy">Scores</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    min={1}
                    max={45}
                    placeholder="1–45"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={playedOn}
                    onChange={(e) => setPlayedOn(e.target.value)}
                  />
                </div>
                <Button type="button" size="sm" disabled={isPending} onClick={saveScore}>
                  {editingScoreId ? "Update score" : "Add score"}
                </Button>
                <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
                  {scores.map((score) => (
                    <li
                      key={score.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-sand/40 px-2 py-1.5"
                    >
                      <span>
                        {score.score} pts · {score.played_on}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
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
                          size="sm"
                          variant="ghost"
                          onClick={() => setScoreToDelete(score)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
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
