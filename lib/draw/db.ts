import type { SupabaseClient } from "@supabase/supabase-js";

import type { DrawEntryInput } from "@/lib/draw/types";
import { subscriptionGrantsAccess } from "@/lib/subscription/grants";
import { fetchAllRows } from "@/lib/supabase/fetch-all";

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
  const data = await fetchAllRows<{ user_id: string; score_snapshot: unknown }>(
    (from, to) =>
      supabase
        .from("draw_entries")
        .select("user_id, score_snapshot")
        .eq("draw_id", drawId)
        .order("user_id")
        .range(from, to),
  );

  return data.map((row) => ({
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

/** Every subscription row's access fields (all members, all history). */
export async function loadSubscriptionAccessRows(
  supabase: SupabaseClient,
): Promise<SubscriptionAccessRow[]> {
  return fetchAllRows<SubscriptionAccessRow>((from, to) =>
    supabase
      .from("subscriptions")
      .select("user_id, status, renewal_date, cancel_at_period_end, created_at")
      .order("id")
      .range(from, to),
  );
}

/** User IDs whose latest subscription currently grants access. */
export async function loadActiveSubscriberIds(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  return activeSubscriberUserIdsFromRows(await loadSubscriptionAccessRows(supabase));
}

/** Latest scores for all users with an active subscription (for algorithmic draws). */
export async function loadActiveSubscriberScores(
  supabase: SupabaseClient,
): Promise<{ activeCount: number; scores: number[]; activeUserIds: Set<string> }> {
  const activeUserIds = await loadActiveSubscriberIds(supabase);

  if (activeUserIds.size === 0) {
    return { activeCount: 0, scores: [], activeUserIds };
  }

  // Read all scores and filter here: an `.in()` list of every active member
  // goes into the request URL and outgrows the gateway's length limit.
  const scoreRows = await fetchAllRows<{ user_id: string; score: number }>(
    (from, to) =>
      supabase.from("scores").select("user_id, score").order("id").range(from, to),
  );

  const scores = scoreRows
    .filter((row) => activeUserIds.has(row.user_id))
    .map((row) => Number(row.score));
  return { activeCount: activeUserIds.size, scores, activeUserIds };
}

export function filterDrawEntriesToActiveSubscribers(
  entries: DrawEntryInput[],
  activeUserIds: Set<string>,
): DrawEntryInput[] {
  return entries.filter((entry) => activeUserIds.has(entry.userId));
}

/** ₹250 of a ₹499 monthly fee: a realistic share for the prize fund. */
const DEFAULT_DRAW_FEE_INR = 250;

/**
 * Draw fund contribution per active subscriber, in whole rupees (major units,
 * not paise). `DRAW_FEE_PER_SUBSCRIBER` is the legacy, unit-less name.
 */
export function getDrawFeeConfig() {
  const fee = Number(
    process.env.DRAW_FEE_PER_SUBSCRIBER_INR ??
      process.env.DRAW_FEE_PER_SUBSCRIBER ??
      String(DEFAULT_DRAW_FEE_INR),
  );
  const poolPercentage = Number(process.env.DRAW_PRIZE_POOL_PERCENTAGE ?? "100");
  return {
    feePerSubscriber: Number.isFinite(fee) ? fee : DEFAULT_DRAW_FEE_INR,
    poolPercentage: Number.isFinite(poolPercentage) ? poolPercentage : 100,
  };
}
