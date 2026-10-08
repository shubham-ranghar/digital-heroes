import type { SupabaseClient } from "@supabase/supabase-js";

import type { DrawEntryInput } from "@/lib/draw/types";
import { subscriptionGrantsAccess } from "@/lib/subscription/grants";

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

type SubscriptionAccessRow = {
  user_id: string;
  status: "active" | "cancelled" | "lapsed" | "past_due";
  renewal_date: string | null;
  cancel_at_period_end?: boolean | null;
  created_at: string;
};

/** Keep only the newest subscription row per user (by created_at). */
export function latestSubscriptionRowPerUser(
  rows: SubscriptionAccessRow[],
): SubscriptionAccessRow[] {
  const byUser = new Map<string, SubscriptionAccessRow>();
  for (const row of rows) {
    const existing = byUser.get(row.user_id);
    if (!existing || row.created_at > existing.created_at) {
      byUser.set(row.user_id, row);
    }
  }
  return Array.from(byUser.values());
}

/** User IDs whose latest subscription row grants product access. */
export function activeSubscriberUserIdsFromRows(
  rows: SubscriptionAccessRow[],
  today = new Date(),
): Set<string> {
  const activeUserIds = new Set<string>();
  for (const row of latestSubscriptionRowPerUser(rows)) {
    if (
      subscriptionGrantsAccess(
        {
          status: row.status,
          renewal_date: row.renewal_date,
          cancel_at_period_end: row.cancel_at_period_end ?? false,
        },
        today,
      )
    ) {
      activeUserIds.add(row.user_id);
    }
  }
  return activeUserIds;
}

/** Latest scores for all users with an active subscription (for algorithmic draws). */
export async function loadActiveSubscriberScores(
  supabase: SupabaseClient,
): Promise<{ activeCount: number; scores: number[]; activeUserIds: Set<string> }> {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("user_id, status, renewal_date, cancel_at_period_end, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const activeUserIds = activeSubscriberUserIdsFromRows(
    (subscriptions ?? []) as SubscriptionAccessRow[],
  );

  if (activeUserIds.size === 0) {
    return { activeCount: 0, scores: [], activeUserIds };
  }

  const { data: scoreRows, error: scoresError } = await supabase
    .from("scores")
    .select("user_id, score")
    .in("user_id", Array.from(activeUserIds));

  if (scoresError) {
    throw new Error(scoresError.message);
  }

  const scores = (scoreRows ?? []).map((row) => Number(row.score));
  return { activeCount: activeUserIds.size, scores, activeUserIds };
}

export function filterDrawEntriesToActiveSubscribers(
  entries: DrawEntryInput[],
  activeUserIds: Set<string>,
): DrawEntryInput[] {
  return entries.filter((entry) => activeUserIds.has(entry.userId));
}

export function getDrawFeeConfig() {
  const fee = Number(process.env.DRAW_FEE_PER_SUBSCRIBER ?? "10");
  const poolPercentage = Number(process.env.DRAW_PRIZE_POOL_PERCENTAGE ?? "100");
  return {
    feePerSubscriber: Number.isFinite(fee) ? fee : 10,
    poolPercentage: Number.isFinite(poolPercentage) ? poolPercentage : 100,
  };
}
