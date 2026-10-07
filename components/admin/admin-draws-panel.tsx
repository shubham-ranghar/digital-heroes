"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
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
import { tabularImpact } from "@/lib/typography";

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
  const selected =
    draws.find((draw) => draw.id === selectedDrawId) ?? draws[0] ?? null;

  function selectDraw(drawId: string) {
    router.push(`/admin/draws?draw=${drawId}`);
  }

  function createDraft() {
    startTransition(async () => {
      const result = await createDraftDrawAction({ month: currentMonthIso() });
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
    startTransition(async () => {
      const result = await runSimulationAction({
        drawId: selected.id,
        mode,
      });
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
    startTransition(async () => {
      const result = await publishDrawAction({ drawId: selected.id });
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
        <Button type="button" size="sm" variant="secondary" disabled={isPending} onClick={createDraft}>
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
            cell: (row) => row.month,
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
          },
          {
            id: "carry",
            header: "Carryover",
            sortable: true,
            sortValue: (row) => row.jackpotCarryover,
            cell: (row) => `£${row.jackpotCarryover.toFixed(2)}`,
          },
          {
            id: "pick",
            header: "",
            cell: (row) => (
              <Button
                type="button"
                size="sm"
                variant={row.id === selected?.id ? "default" : "ghost"}
                onClick={() => selectDraw(row.id)}
              >
                Select
              </Button>
            ),
          },
        ]}
      />

      {selected ? (
        <div className="rounded-[20px] border border-line bg-surface p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-sans text-lg text-navy">Draw {selected.month}</p>
              <p className="text-sm text-muted-foreground">
                Simulation required before publish. Published draws are locked.
              </p>
            </div>
            <StatusPill value={selected.status} />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] space-y-1">
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
              disabled={isPending || selected.status === "published"}
              onClick={runSimulation}
            >
              Run simulation
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending || !canPublish}
              onClick={publishDraw}
            >
              Publish draw
            </Button>
          </div>

          {preview ? (
            <div className="space-y-4 border-t border-line pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate">
                  Winning numbers
                </p>
                <p className={tabularImpact}>
                  <span className="font-sans text-2xl text-coral">
                    {preview.winningNumbers.join(" · ")}
                  </span>
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 text-sm">
                <div className="rounded-xl bg-sand/40 px-3 py-2">
                  <p className="text-slate">Total pool</p>
                  <p className="font-sans text-navy">
                    £{preview.totalPool.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-sand/40 px-3 py-2">
                  <p className="text-slate">5-match</p>
                  <p className="font-sans text-navy">
                    £{preview.tier5Pool.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-sand/40 px-3 py-2">
                  <p className="text-slate">4-match</p>
                  <p className="font-sans text-navy">
                    £{preview.tier4Pool.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-sand/40 px-3 py-2">
                  <p className="text-slate">3-match</p>
                  <p className="font-sans text-navy">
                    £{preview.tier3Pool.toFixed(2)}
                  </p>
                </div>
              </div>
              {preview.nextJackpotCarryover > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Unclaimed 5-match funds roll forward: £
                  {preview.nextJackpotCarryover.toFixed(2)}
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
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                      >
                        <span className="text-slate">
                          {winner.userId.slice(0, 8)}… · {winner.matchCount}-match
                        </span>
                        <span className={tabularImpact}>
                          Tier {winner.tier} · £{winner.prizeAmount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground border-t border-line pt-4">
              Run a simulation to preview winning numbers, pools, and allocations.
            </p>
          )}

          <Button variant="ghost" size="sm" render={<Link href="/admin/winners" />}>
            Review winners after publish →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
