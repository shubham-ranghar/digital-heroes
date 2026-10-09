"use server";

import { revalidatePath } from "next/cache";

import { actionFailure } from "@/lib/actions/failure";
import { syncUserDrawEntryForCurrentMonth } from "@/lib/draw/sync-entry";
import { requireActiveSubscription } from "@/lib/subscription/access";
import {
  mapScoreWriteError,
  outsideLatestFiveError,
  type ScoreWriteError,
} from "@/lib/scores/errors";
import { findRetentionCutoff } from "@/lib/scores/rolling";
import type { ScoreActionResult, ScoreRow } from "@/lib/scores/types";
import { scoreFormSchema, scoreIdSchema } from "@/lib/validations/score";
import type { ZodError } from "zod";

function fieldErrorsFromZod(error: ZodError): Partial<Record<string, string>> {
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const result: Partial<Record<string, string>> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) {
      result[key] = messages[0];
    }
  }
  return result;
}

async function listUserScores(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >,
  userId: string,
) {
  const { data, error } = await supabase
    .from("scores")
    .select("id, user_id, score, played_on, created_at")
    .eq("user_id", userId)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ScoreRow[];
}

/**
 * Fresh score list after a successful write. The write has already happened,
 * so a failed read says so instead of reporting the save itself as failed.
 */
async function scoresAfterWrite(
  supabase: Parameters<typeof listUserScores>[0],
  userId: string,
  done: "saved" | "deleted",
): Promise<ScoreActionResult> {
  try {
    return { ok: true, scores: await listUserScores(supabase, userId) };
  } catch (error) {
    console.error(`Score ${done}, but re-reading scores failed:`, error);
    return {
      ok: false,
      message: `Your score was ${done}, but the list could not refresh. Reload the page.`,
    };
  }
}

function failure(
  error: ScoreWriteError,
  duplicate?: ScoreRow,
): ScoreActionResult {
  return {
    ok: false,
    reason: error.reason,
    message: error.message,
    fieldErrors: { playedOn: error.fieldError },
    duplicate,
  };
}

export async function saveScoreAction(
  input: unknown,
): Promise<ScoreActionResult> {
  const parsed = scoreFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
      message: "Fix the highlighted fields and try again.",
    };
  }

  const { supabase, user } = await requireActiveSubscription();
  const { scoreId, score, playedOn } = parsed.data;

  // Pre-check for a specific message; the DB trigger (DH001) is the authority.
  let existing: ScoreRow[];
  try {
    existing = await listUserScores(supabase, user.id);
  } catch (error) {
    return actionFailure(error, "save your score");
  }
  const cutoff = findRetentionCutoff(existing, { id: scoreId, played_on: playedOn });
  if (cutoff) {
    return failure(outsideLatestFiveError("self", cutoff.played_on));
  }

  if (scoreId) {
    const { data, error } = await supabase
      .from("scores")
      .update({ score, played_on: playedOn })
      .eq("id", scoreId)
      .eq("user_id", user.id)
      .select("id, user_id, score, played_on, created_at")
      .maybeSingle();

    if (error) {
      const mapped = mapScoreWriteError(error, "self");
      return mapped ? failure(mapped) : { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "Score not found or access denied." };
    }

    revalidatePath("/dashboard/scores");
    revalidatePath("/dashboard");
    try {
      await syncUserDrawEntryForCurrentMonth(user.id);
    } catch {
      /* draw row may not exist yet */
    }
    return scoresAfterWrite(supabase, user.id, "saved");
  }

  const { data: inserted, error } = await supabase
    .from("scores")
    .insert({
      user_id: user.id,
      score,
      played_on: playedOn,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    const mapped = mapScoreWriteError(error, "self");
    if (mapped?.reason === "duplicate_date") {
      const { data: sameDay } = await supabase
        .from("scores")
        .select("id, user_id, score, played_on, created_at")
        .eq("user_id", user.id)
        .eq("played_on", playedOn)
        .maybeSingle();
      return failure(mapped, (sameDay as ScoreRow | null) ?? undefined);
    }
    if (mapped) {
      return failure(mapped);
    }
    return { ok: false, message: error?.message ?? "Could not save score." };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  try {
    await syncUserDrawEntryForCurrentMonth(user.id);
  } catch {
    /* draw row may not exist yet */
  }
  const after = await scoresAfterWrite(supabase, user.id, "saved");
  // Never report success for a row the retention trim removed.
  if (after.ok && !after.scores.some((row) => row.id === inserted.id)) {
    return { ok: false, message: "Your score could not be kept. Refresh and try again." };
  }
  return after;
}

export async function deleteScoreAction(
  input: unknown,
): Promise<ScoreActionResult> {
  const parsed = scoreIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid score.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { supabase, user } = await requireActiveSubscription();
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", parsed.data.scoreId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  try {
    await syncUserDrawEntryForCurrentMonth(user.id);
  } catch {
    /* draw row may not exist yet */
  }
  return scoresAfterWrite(supabase, user.id, "deleted");
}
