import type { SupabaseClient } from "@supabase/supabase-js";

import { keepLatestScores } from "@/lib/scores/rolling";
import { loadActiveSubscriberIds } from "@/lib/draw/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";

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

/** Rows per upsert request, and ids per `.in()` filter (kept short for URL length). */
const UPSERT_CHUNK = 500;
const DELETE_CHUNK = 100;

/**
 * Admin: refresh all active subscribers' entries for a draw before simulation.
 * Same result as `syncUserDrawEntry` per member, but in a handful of bulk
 * queries instead of three round trips per member. Pass `activeUserIds` when
 * the caller already loaded them.
 */
export async function syncAllDrawEntriesForDraw(
  supabase: SupabaseClient,
  drawId: string,
  activeUserIds?: Set<string>,
): Promise<number> {
  const [{ data: draw, error: drawError }, activeIds, scoreRows, entryRows] =
    await Promise.all([
      supabase.from("draws").select("id, status").eq("id", drawId).maybeSingle(),
      activeUserIds ?? loadActiveSubscriberIds(supabase),
      fetchAllRows<ScoreRow & { user_id: string }>((from, to) =>
        supabase
          .from("scores")
          .select("id, user_id, score, played_on, created_at")
          .order("id")
          .range(from, to),
      ),
      fetchAllRows<{ user_id: string }>((from, to) =>
        supabase
          .from("draw_entries")
          .select("user_id")
          .eq("draw_id", drawId)
          .order("user_id")
          .range(from, to),
      ),
    ]);

  if (drawError) {
    throw new Error(drawError.message);
  }
  if (!draw || draw.status === "published") {
    return 0;
  }

  const scoresByUser = new Map<string, ScoreRow[]>();
  for (const row of scoreRows) {
    if (!activeIds.has(row.user_id)) {
      continue;
    }
    const list = scoresByUser.get(row.user_id) ?? [];
    list.push(row);
    scoresByUser.set(row.user_id, list);
  }

  const upserts = Array.from(scoresByUser, ([userId, rows]) => ({
    draw_id: drawId,
    user_id: userId,
    score_snapshot: keepLatestScores(rows).map((row) => row.score),
  }));

  // Active members with no scores left lose their entry (stale snapshot).
  const staleUserIds = entryRows
    .map((row) => row.user_id)
    .filter((userId) => activeIds.has(userId) && !scoresByUser.has(userId));

  const writes: PromiseLike<{ error: { message: string } | null }>[] = [];
  for (let i = 0; i < upserts.length; i += UPSERT_CHUNK) {
    writes.push(
      supabase
        .from("draw_entries")
        .upsert(upserts.slice(i, i + UPSERT_CHUNK), {
          onConflict: "draw_id,user_id",
        }),
    );
  }
  for (let i = 0; i < staleUserIds.length; i += DELETE_CHUNK) {
    writes.push(
      supabase
        .from("draw_entries")
        .delete()
        .eq("draw_id", drawId)
        .in("user_id", staleUserIds.slice(i, i + DELETE_CHUNK)),
    );
  }

  for (const { error } of await Promise.all(writes)) {
    if (error) {
      throw new Error(error.message);
    }
  }

  return activeIds.size;
}
