import type { SupabaseClient } from "@supabase/supabase-js";

import { keepLatestScores } from "@/lib/scores/rolling";
import { loadActiveSubscriberIds } from "@/lib/draw/db";
import { createAdminClient } from "@/lib/supabase/admin";

/** First calendar day of the current UTC month (draw month key). */
export function currentDrawMonthIso(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

type ScoreRow = {
  id: string;
  score: number;
  played_on: string;
  created_at?: string;
};

async function loadUserScoreSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("id, score, played_on, created_at")
    .eq("user_id", userId)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const kept = keepLatestScores((data ?? []) as ScoreRow[]);
  return kept.map((row) => row.score);
}

/**
 * Upsert this member's draw entry for the given draw (latest five scores).
 * Skips published draws. Removes the entry when the member has no scores left,
 * so a stale snapshot can't be matched at publish.
 */
export async function syncUserDrawEntry(
  supabase: SupabaseClient,
  userId: string,
  drawId: string,
): Promise<void> {
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .select("id, status")
    .eq("id", drawId)
    .maybeSingle();

  if (drawError) {
    throw new Error(drawError.message);
  }

  if (!draw || draw.status === "published") {
    return;
  }

  const snapshot = await loadUserScoreSnapshot(supabase, userId);
  if (snapshot.length === 0) {
    const { error: deleteError } = await supabase
      .from("draw_entries")
      .delete()
      .eq("draw_id", drawId)
      .eq("user_id", userId);
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    return;
  }

  const { error } = await supabase.from("draw_entries").upsert(
    {
      draw_id: drawId,
      user_id: userId,
      score_snapshot: snapshot,
    },
    { onConflict: "draw_id,user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

/** Resolve the draw row for a month, if it exists. */
export async function getDrawIdForMonth(
  supabase: SupabaseClient,
  monthIso: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("draws")
    .select("id")
    .eq("month", monthIso)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ? String(data.id) : null;
}

/**
 * Sync entry for the current month's draw when one exists.
 *
 * Uses the service-role client: RLS hides unpublished draws from members, so
 * the member's own client can never find the draft draw to enter. `userId`
 * must come from the server session, never from client input.
 */
export async function syncUserDrawEntryForCurrentMonth(
  userId: string,
): Promise<void> {
  const admin = createAdminClient();
  const drawId = await getDrawIdForMonth(admin, currentDrawMonthIso());
  if (!drawId) {
    return;
  }
  await syncUserDrawEntry(admin, userId, drawId);
}

/** Admin: refresh all active subscribers' entries for a draw before simulation. */
export async function syncAllDrawEntriesForDraw(
  supabase: SupabaseClient,
  drawId: string,
): Promise<number> {
  const activeUserIds = await loadActiveSubscriberIds(supabase);

  let synced = 0;
  for (const userId of activeUserIds) {
    await syncUserDrawEntry(supabase, userId, drawId);
    synced += 1;
  }

  return synced;
}
