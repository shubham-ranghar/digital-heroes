"use server";

import { revalidatePath } from "next/cache";

import { listAdminUserScores } from "@/lib/admin/queries";
import { actionFailure } from "@/lib/actions/failure";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapScoreWriteError, outsideLatestFiveError } from "@/lib/scores/errors";
import { findRetentionCutoff } from "@/lib/scores/rolling";
import type { ScoreRow } from "@/lib/scores/types";
import {
  adminProfileSchema,
  adminScoreDeleteSchema,
  adminScoreSchema,
  adminSubscriptionSchema,
} from "@/lib/validations/admin";

export type AdminMutationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function revalidateAdminUsers() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
}

export async function fetchAdminUserScoresAction(
  userId: string,
): Promise<{ ok: true; scores: ScoreRow[] } | { ok: false; message: string }> {
  await requireAdmin();
  if (!userId) {
    return { ok: false, message: "User required." };
  }
  try {
    const scores = await listAdminUserScores(userId);
    return { ok: true, scores: scores as ScoreRow[] };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not load scores.",
    };
  }
}

async function updateAdminProfile(
  input: unknown,
): Promise<AdminMutationResult> {
  const parsed = adminProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid profile data." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      display_name: parsed.data.displayName || null,
      role: parsed.data.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAdminUsers();
  return { ok: true, message: "Profile updated." };
}

async function updateAdminSubscription(
  input: unknown,
): Promise<AdminMutationResult> {
  const parsed = adminSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid subscription data." };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", parsed.data.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    plan: parsed.data.plan,
    status: parsed.data.status,
    renewal_date: parsed.data.renewalDate || null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await admin
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      return { ok: false, message: error.message };
    }
  } else {
    const { error } = await admin.from("subscriptions").insert({
      user_id: parsed.data.userId,
      ...payload,
    });
    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidateAdminUsers();
  return { ok: true, message: "Subscription updated." };
}

async function saveAdminScore(
  input: unknown,
): Promise<AdminMutationResult> {
  const parsed = adminScoreSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid score data." };
  }

  const admin = createAdminClient();
  const { userId, scoreId, score, playedOn } = parsed.data;

  // Same retention rule as the member path; the DB trigger (DH001) also
  // applies to the service-role client, so this is for the specific message.
  const { data: existing, error: listError } = await admin
    .from("scores")
    .select("id, score, played_on, created_at")
    .eq("user_id", userId);
  if (listError) {
    return { ok: false, message: listError.message };
  }
  const cutoff = findRetentionCutoff(existing ?? [], {
    id: scoreId,
    played_on: playedOn,
  });
  if (cutoff) {
    return {
      ok: false,
      message: outsideLatestFiveError("admin", cutoff.played_on).message,
    };
  }

  if (scoreId) {
    const { data, error } = await admin
      .from("scores")
      .update({ score, played_on: playedOn })
      .eq("id", scoreId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: mapScoreWriteError(error, "admin")?.message ?? error.message,
      };
    }
    if (!data) {
      return { ok: false, message: "Score not found." };
    }
  } else {
    const { error } = await admin.from("scores").insert({
      user_id: userId,
      score,
      played_on: playedOn,
    });

    if (error) {
      return {
        ok: false,
        message: mapScoreWriteError(error, "admin")?.message ?? error.message,
      };
    }
  }

  revalidateAdminUsers();
  revalidatePath("/dashboard");
  return { ok: true, message: "Score saved." };
}

async function deleteAdminScore(
  input: unknown,
): Promise<AdminMutationResult> {
  const parsed = adminScoreDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid score reference." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("scores")
    .delete()
    .eq("id", parsed.data.scoreId)
    .eq("user_id", parsed.data.userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAdminUsers();
  revalidatePath("/dashboard");
  return { ok: true, message: "Score deleted." };
}

// Exported actions: auth first (its redirect must not be caught), then the
// work, with any unexpected error returned as { ok: false } instead of thrown.

export async function updateAdminProfileAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  try {
    return await updateAdminProfile(input);
  } catch (error) {
    return actionFailure(error, "update the profile", { exposeMessage: true });
  }
}

export async function updateAdminSubscriptionAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  try {
    return await updateAdminSubscription(input);
  } catch (error) {
    return actionFailure(error, "update the subscription", { exposeMessage: true });
  }
}

export async function saveAdminScoreAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  try {
    return await saveAdminScore(input);
  } catch (error) {
    return actionFailure(error, "save the score", { exposeMessage: true });
  }
}

export async function deleteAdminScoreAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  try {
    return await deleteAdminScore(input);
  } catch (error) {
    return actionFailure(error, "delete the score", { exposeMessage: true });
  }
}
