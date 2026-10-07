"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { winnerIdSchema } from "@/lib/validations/winner";
import { createClient } from "@/lib/supabase/server";

export type AdminWinnerActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

async function getWinnerForAdmin(winnerId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("winners")
    .select("id, verification, payment, proof_url")
    .eq("id", winnerId)
    .maybeSingle();

  if (error || !data) {
    return { error: "Winner record not found." as const };
  }

  return { supabase, winner: data };
}

export async function approveWinnerAction(
  input: unknown,
): Promise<AdminWinnerActionResult> {
  const parsed = winnerIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid winner reference." };
  }

  const result = await getWinnerForAdmin(parsed.data.winnerId);
  if ("error" in result) {
    return { ok: false, message: result.error ?? "Winner record not found." };
  }

  if (!result.winner.proof_url) {
    return { ok: false, message: "Upload proof before approval." };
  }

  const { error } = await result.supabase
    .from("winners")
    .update({
      verification: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.winnerId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard/prizes");
  return { ok: true, message: "Winner approved." };
}

export async function rejectWinnerAction(
  input: unknown,
): Promise<AdminWinnerActionResult> {
  const parsed = winnerIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid winner reference." };
  }

  const result = await getWinnerForAdmin(parsed.data.winnerId);
  if ("error" in result) {
    return { ok: false, message: result.error ?? "Winner record not found." };
  }

  const { error } = await result.supabase
    .from("winners")
    .update({
      verification: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.winnerId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard/prizes");
  return { ok: true, message: "Winner rejected — member may re-upload proof." };
}

export async function markWinnerPaidAction(
  input: unknown,
): Promise<AdminWinnerActionResult> {
  const parsed = winnerIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid winner reference." };
  }

  const result = await getWinnerForAdmin(parsed.data.winnerId);
  if ("error" in result) {
    return { ok: false, message: result.error ?? "Winner record not found." };
  }

  if (result.winner.verification !== "approved") {
    return {
      ok: false,
      message: "Approve verification before marking as paid.",
    };
  }

  if (result.winner.payment === "paid") {
    return { ok: false, message: "This prize is already marked paid." };
  }

  const { error } = await result.supabase
    .from("winners")
    .update({
      payment: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.winnerId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard/prizes");
  return { ok: true, message: "Payment marked as paid." };
}
