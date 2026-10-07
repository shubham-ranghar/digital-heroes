import type { SupabaseClient } from "@supabase/supabase-js";

import type { DrawEntryInput } from "@/lib/draw/types";
import { subscriptionGrantsAccess } from "@/lib/subscription/access";

export function parseScoreSnapshot(snapshot: unknown): number[] {
  if (!Array.isArray(snapshot)) {
    return [];
  }
  return snapshot
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

export async function loadDrawEntries(
  supabase: SupabaseClient,
  drawId: string,
): Promise<DrawEntryInput[]> {
  const { data, error } = await supabase
    .from("draw_entries")
    .select("user_id, score_snapshot")
    .eq("draw_id", drawId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id as string,
    scores: parseScoreSnapshot(row.score_snapshot),
  }));
}

/** Latest scores for all users with an active subscription (for algorithmic draws). */
export async function loadActiveSubscriberScores(
  supabase: SupabaseClient,
): Promise<{ activeCount: number; scores: number[] }> {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("user_id, status, renewal_date")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const activeUserIds = new Set<string>();
  for (const row of subscriptions ?? []) {
    if (
      subscriptionGrantsAccess({
        status: row.status as "active" | "cancelled" | "lapsed",
        renewal_date: row.renewal_date as string | null,
      })
    ) {
      activeUserIds.add(row.user_id as string);
    }
  }

  if (activeUserIds.size === 0) {
    return { activeCount: 0, scores: [] };
  }

  const { data: scoreRows, error: scoresError } = await supabase
    .from("scores")
    .select("user_id, score")
    .in("user_id", Array.from(activeUserIds));

  if (scoresError) {
    throw new Error(scoresError.message);
  }

  const scores = (scoreRows ?? []).map((row) => Number(row.score));
  return { activeCount: activeUserIds.size, scores };
}

export function getDrawFeeConfig() {
  const fee = Number(process.env.DRAW_FEE_PER_SUBSCRIBER ?? "10");
  const poolPercentage = Number(process.env.DRAW_PRIZE_POOL_PERCENTAGE ?? "100");
  return {
    feePerSubscriber: Number.isFinite(fee) ? fee : 10,
    poolPercentage: Number.isFinite(poolPercentage) ? poolPercentage : 100,
  };
}
