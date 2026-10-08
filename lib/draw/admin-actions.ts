"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  filterDrawEntriesToActiveSubscribers,
  getDrawFeeConfig,
  loadActiveSubscriberScores,
  loadDrawEntries,
} from "@/lib/draw/db";
import { computePublishDrawOutcome } from "@/lib/draw/publish-outcome";
import { simulateDraw, type DrawMode } from "@/lib/draw/simulate";
import { syncAllDrawEntriesForDraw } from "@/lib/draw/sync-entry";
import { createAdminClient } from "@/lib/supabase/admin";
import { drawCreateSchema } from "@/lib/validations/admin";

export type DrawSimulationPreview = {
  winningNumbers: number[];
  totalPool: number;
  tier5Pool: number;
  tier4Pool: number;
  tier3Pool: number;
  nextJackpotCarryover: number;
  winners: {
    userId: string;
    tier: number;
    prizeAmount: number;
    matchCount: number;
  }[];
};

export type DrawAdminResult =
  | { ok: true; message: string; preview?: DrawSimulationPreview }
  | { ok: false; message: string };

function toPreview(simulation: ReturnType<typeof simulateDraw>): DrawSimulationPreview {
  const winnerRows = simulation.prizes.allocations.map((allocation) => {
    const match = simulation.matches.find(
      (row) => row.userId === allocation.userId && row.tier === allocation.tier,
    );
    return {
      userId: allocation.userId,
      tier: allocation.tier,
      prizeAmount: allocation.prizeAmount,
      matchCount: match?.matchCount ?? allocation.tier,
    };
  });

  return {
    winningNumbers: simulation.winningNumbers,
    totalPool: simulation.pools.totalPool,
    tier5Pool: simulation.pools.tier5Pool,
    tier4Pool: simulation.pools.tier4Pool,
    tier3Pool: simulation.pools.tier3Pool,
    nextJackpotCarryover: simulation.prizes.nextJackpotCarryover,
    winners: winnerRows,
  };
}

function nextMonthIso(monthIso: string): string {
  const date = new Date(`${monthIso}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export async function runSimulationAction(input: {
  drawId: string;
  mode: DrawMode;
}): Promise<DrawAdminResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: draw, error } = await admin
    .from("draws")
    .select("id, status, month, jackpot_carryover, mode")
    .eq("id", input.drawId)
    .maybeSingle();

  if (error || !draw) {
    return { ok: false, message: "Draw not found." };
  }

  if (draw.status === "published") {
    return { ok: false, message: "Published draws cannot be re-simulated." };
  }

  const syncedCount = await syncAllDrawEntriesForDraw(admin, draw.id);

  const rawEntries = await loadDrawEntries(admin, draw.id);
  const { activeCount, scores, activeUserIds } =
    await loadActiveSubscriberScores(admin);
  const entries = filterDrawEntriesToActiveSubscribers(
    rawEntries,
    activeUserIds,
  );
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();

  const simulation = simulateDraw({
    mode: input.mode,
    entries,
    subscriberScores: scores,
    activeSubscribers: activeCount,
    feePerSubscriber,
    poolPercentage,
    carryover: Number(draw.jackpot_carryover ?? 0),
  });

  const { error: updateError } = await admin
    .from("draws")
    .update({
      status: "simulated",
      mode: input.mode,
      winning_numbers: simulation.winningNumbers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draw.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/draws");
  return {
    ok: true,
    message: `Simulation complete (${syncedCount} member entries synced). Winning numbers: ${simulation.winningNumbers.join(", ")}.`,
    preview: toPreview(simulation),
  };
}

export async function createDraftDrawAction(input: {
  month: string;
}): Promise<DrawAdminResult> {
  await requireAdmin();

  const parsed = drawCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid draw month.",
    };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("draws").insert({
    month: parsed.data.month,
    status: "draft",
    mode: "random",
    jackpot_carryover: 0,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/draws");
  return { ok: true, message: "Draft draw created." };
}

export async function publishDrawAction(input: {
  drawId: string;
}): Promise<DrawAdminResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: draw, error } = await admin
    .from("draws")
    .select("id, status, month, jackpot_carryover, winning_numbers, mode")
    .eq("id", input.drawId)
    .maybeSingle();

  if (error || !draw) {
    return { ok: false, message: "Draw not found." };
  }

  if (draw.status !== "simulated") {
    return {
      ok: false,
      message: "Run a simulation before publishing this draw.",
    };
  }

  const winningNumbers = Array.isArray(draw.winning_numbers)
    ? (draw.winning_numbers as number[])
    : null;

  if (!winningNumbers || winningNumbers.length !== 5) {
    return { ok: false, message: "Draw is missing simulated winning numbers." };
  }

  await syncAllDrawEntriesForDraw(admin, draw.id);

  const rawEntries = await loadDrawEntries(admin, draw.id);
  const { activeCount, scores, activeUserIds } =
    await loadActiveSubscriberScores(admin);
  const entries = filterDrawEntriesToActiveSubscribers(
    rawEntries,
    activeUserIds,
  );
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();

  const simulation = computePublishDrawOutcome({
    storedWinningNumbers: winningNumbers,
    entries,
    subscriberScores: scores,
    activeSubscribers: activeCount,
    feePerSubscriber,
    poolPercentage,
    carryover: Number(draw.jackpot_carryover ?? 0),
  });

  await admin.from("winners").delete().eq("draw_id", draw.id);

  if (simulation.prizes.allocations.length > 0) {
    const { error: winnersError } = await admin.from("winners").insert(
      simulation.prizes.allocations.map((allocation) => ({
        draw_id: draw.id,
        user_id: allocation.userId,
        tier: allocation.tier,
        prize_amount: allocation.prizeAmount,
        verification: "pending",
        payment: "pending",
      })),
    );

    if (winnersError) {
      return { ok: false, message: winnersError.message };
    }
  }

  const { error: publishError } = await admin
    .from("draws")
    .update({
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", draw.id);

  if (publishError) {
    return { ok: false, message: publishError.message };
  }

  const nextMonth = nextMonthIso(draw.month as string);
  const carryover = simulation.prizes.nextJackpotCarryover;

  if (carryover > 0) {
    const { data: nextDraw } = await admin
      .from("draws")
      .select("id, jackpot_carryover")
      .eq("month", nextMonth)
      .maybeSingle();

    if (nextDraw?.id) {
      await admin
        .from("draws")
        .update({
          jackpot_carryover:
            Number(nextDraw.jackpot_carryover ?? 0) + carryover,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nextDraw.id);
    } else {
      await admin.from("draws").insert({
        month: nextMonth,
        status: "draft",
        mode: "random",
        jackpot_carryover: carryover,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/draws");
  revalidatePath("/admin/winners");
  revalidatePath("/admin/reports");
  return {
    ok: true,
    message: `Draw published with ${simulation.prizes.allocations.length} winner(s).`,
  };
}
