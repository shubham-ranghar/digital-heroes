"use server";

import { revalidatePath } from "next/cache";

import { syncUserDrawEntryForCurrentMonth } from "@/lib/draw/sync-entry";
import { requireActiveSubscription } from "@/lib/subscription/access";
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

  if (scoreId) {
    const { data, error } = await supabase
      .from("scores")
      .update({ score, played_on: playedOn })
      .eq("id", scoreId)
      .eq("user_id", user.id)
      .select("id, user_id, score, played_on, created_at")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "You already have a score for that date.",
          fieldErrors: { playedOn: "One score per calendar date" },
        };
      }
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "Score not found or access denied." };
    }

    revalidatePath("/dashboard/scores");
    revalidatePath("/dashboard");
    try {
      await syncUserDrawEntryForCurrentMonth(supabase, user.id);
    } catch {
      /* draw row may not exist yet */
    }
    const scores = await listUserScores(supabase, user.id);
    return { ok: true, scores };
  }

  const { error } = await supabase.from("scores").insert({
    user_id: user.id,
    score,
    played_on: playedOn,
  });

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("scores")
        .select("id, user_id, score, played_on, created_at")
        .eq("user_id", user.id)
        .eq("played_on", playedOn)
        .maybeSingle();

      return {
        ok: false,
        message: "You already logged a score for this date.",
        fieldErrors: { playedOn: "One score per calendar date" },
        duplicate: existing as ScoreRow | undefined,
      };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  try {
    await syncUserDrawEntryForCurrentMonth(supabase, user.id);
  } catch {
    /* draw row may not exist yet */
  }
  const scores = await listUserScores(supabase, user.id);
  return { ok: true, scores };
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
    await syncUserDrawEntryForCurrentMonth(supabase, user.id);
  } catch {
    /* draw row may not exist yet */
  }
  const scores = await listUserScores(supabase, user.id);
  return { ok: true, scores };
}
