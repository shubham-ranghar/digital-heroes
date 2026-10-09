"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { CountUpCurrency } from "@/components/draw/count-up-currency";
import { DrawStatusSteps } from "@/components/draw/draw-status-steps";
import { WinningNumbers } from "@/components/draw/winning-numbers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminDrawRow } from "@/lib/admin/queries";
import type { DrawSimulationPreview } from "@/lib/draw/admin-actions";
import {
  createDraftDrawAction,
  publishDrawAction,
  runSimulationAction,
} from "@/lib/draw/admin-actions";
import type { DrawMode } from "@/lib/draw/simulate";
import { formatMonthLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";
import { editorialKeyNumber } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type PendingAction = "create" | "simulate" | "publish" | null;

type SerializedPreview = DrawSimulationPreview | null;

type AdminDrawsPanelProps = {
  draws: AdminDrawRow[];
  selectedDrawId: string | null;
  preview: SerializedPreview;
};

function currentMonthIso(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function AdminDrawsPanel({
  draws,
  selectedDrawId,
  preview,
}: AdminDrawsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<DrawMode>("random");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const selected =
    draws.find((draw) => draw.id === selectedDrawId) ?? draws[0] ?? null;

  function selectDraw(drawId: string) {
    router.push(`/admin/draws?draw=${drawId}`);
  }

  function createDraft() {
    setPendingAction("create");
    startTransition(async () => {
      const result = await createDraftDrawAction({ month: currentMonthIso() });
      setPendingAction(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function runSimulation() {
    if (!selected) {
      return;
    }
    setPendingAction("simulate");
    startTransition(async () => {
      const result = await runSimulationAction({
        drawId: selected.id,
        mode,
      });
      setPendingAction(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function publishDraw() {
    if (!selected) {
      return;
    }
    setPendingAction("publish");
    startTransition(async () => {
      const result = await publishDrawAction({ drawId: selected.id });
      setPendingAction(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  const canPublish = selected?.status === "simulated";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={createDraft}
        >
          Create draft (this month)
        </Button>
      </div>

      <SortableDataTable
        rows={draws}
        getRowId={(row) => row.id}
        emptyMessage="No draws yet. Create a draft for the current month."
        columns={[
          {
            id: "month",
            header: "Month",
            sortable: true,
            sortValue: (row) => row.month,
            cell: (row) => formatMonthLabel(row.month),
          },
          {
            id: "status",
            header: "Status",
            sortable: true,
            sortValue: (row) => row.status,
            cell: (row) => <StatusPill value={row.status} />,
          },
          {
            id: "mode",
            header: "Mode",
            sortable: true,
            sortValue: (row) => row.mode,
            cell: (row) => row.mode,
          },
          {
            id: "entries",
            header: "Entries",
            sortable: true,
            sortValue: (row) => row.entryCount,
            cell: (row) => row.entryCount,
            numeric: true,
          },
          {
            id: "carry",
            header: "Carryover",
            sortable: true,
            sortValue: (row) => row.jackpotCarryover,
            cell: (row) => formatCurrency(row.jackpotCarryover),
            numeric: true,
          },
          {
            id: "pick",
            header: "",
            className: "!whitespace-normal",
            // The selected row shows a state indicator; only the others get an
            // affordance to switch (bordered, so it reads as clickable).
            cell: (row) =>
              row.id === selected?.id ? (
                <span className="inline-flex items-center gap-2 px-1 text-sm font-medium text-navy">
                  <span className="size-2 shrink-0 rounded-full bg-coral" aria-hidden />
                  Selected
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectDraw(row.id)}
                >
                  Select
                </Button>
              ),
          },
        ]}
      />

      {selected ? (
        <div className="space-y-5 rounded-[20px] border border-line bg-surface p-5 shadow-[var(--shadow-resting)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-sans text-lg text-navy">
                Draw · {formatMonthLabel(selected.month)}
              </p>
              <p className="text-sm text-muted-foreground">
                Simulation required before publish. Published draws are locked.
              </p>
            </div>
            <DrawStatusSteps status={selected.status} className="flex-wrap" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="w-full min-w-0 space-y-1 sm:max-w-xs sm:flex-1">
              <label className="text-xs text-slate">Draw mode</label>
              <Select
                value={mode}
                onValueChange={(value) => value && setMode(value as DrawMode)}
                disabled={selected.status === "published" || isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="algorithmic">Algorithmic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isPending || selected.status === "published"}
              loading={pendingAction === "simulate"}
              onClick={runSimulation}
            >
              {pendingAction === "simulate" ? "Simulating…" : "Run simulation"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={isPending || !canPublish}
              loading={pendingAction === "publish"}
              onClick={publishDraw}
            >
              {pendingAction === "publish" ? "Publishing…" : "Publish draw"}
            </Button>
          </div>

          {preview ? (
            <div
              key={preview.winningNumbers.join("-")}
              className="space-y-5 border-t border-line pt-5"
            >
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-slate">
                  Winning numbers
                </p>
                <WinningNumbers numbers={preview.winningNumbers} />
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div
                  data-nav-theme="dark"
                  className="section-navy rounded-xl border border-navy bg-navy px-4 py-3 sm:col-span-2 lg:col-span-1 lg:row-span-1"
                >
                  <p className="text-xs uppercase tracking-wide text-cream/75">
                    5-match jackpot
                  </p>
                  <CountUpCurrency
                    value={preview.tier5Pool}
                    className={cn("mt-1 block text-[2rem]", editorialKeyNumber)}
                  />
                </div>
                <PoolTile label="Total pool" value={preview.totalPool} />
                <PoolTile label="4-match" value={preview.tier4Pool} />
                <PoolTile label="3-match" value={preview.tier3Pool} />
              </div>
              {preview.nextJackpotCarryover > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Unclaimed 5-match funds roll forward:{" "}
                  {formatCurrency(preview.nextJackpotCarryover)}
                </p>
              ) : null}
              <div>
                <p className="mb-2 text-sm font-medium text-navy">
                  Winner preview ({preview.winners.length})
                </p>
                {preview.winners.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No qualifying matches for this simulation.
                  </p>
                ) : (
                  <ul className="divide-y divide-line rounded-xl border border-line text-sm">
                    {preview.winners.map((winner) => (
                      <li
                        key={`${winner.userId}-${winner.tier}`}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 px-3 py-2",
                          winner.tier === 5 && "bg-coral/8",
                        )}
                      >
                        <span className="text-slate">
                          {winner.userId.slice(0, 8)}… · {winner.matchCount}-match
                        </span>
                        <span className={tabularImpact}>
                          Tier {winner.tier} · {formatCurrency(winner.prizeAmount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-t border-line pt-4">
              <div className="flex shrink-0 gap-1.5" aria-hidden>
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className="size-6 rounded-full border border-dashed border-slate/40 bg-sand/40"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Run a simulation to preview winning numbers, pools, and allocations.
              </p>
            </div>
          )}

          <Button variant="ghost" size="sm" render={<Link href="/admin/winners" />}>
            Review winners after publish →
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function PoolTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-sand/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
      <CountUpCurrency
        value={value}
        className="mt-1 block font-sans text-xl font-medium text-navy"
      />
    </div>
  );
}
