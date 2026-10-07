"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  PROOF_ALLOWED_MIME,
  PROOF_MAX_BYTES,
} from "@/lib/winners/constants";
import { buildProofStoragePath, proofBucket } from "@/lib/winners/storage";
import { winnerIdSchema } from "@/lib/validations/winner";
import { createClient } from "@/lib/supabase/server";

export type WinnerActionResult =
  | { ok: true; message?: string; signedUrl?: string }
  | { ok: false; message: string };

export async function uploadWinnerProofAction(
  formData: FormData,
): Promise<WinnerActionResult> {
  const parsed = winnerIdSchema.safeParse({
    winnerId: formData.get("winnerId"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid winner reference." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a screenshot image to upload." };
  }

  if (file.size > PROOF_MAX_BYTES) {
    return { ok: false, message: "Image must be 5MB or smaller." };
  }

  if (!PROOF_ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      message: "Use a PNG, JPEG, or WebP screenshot.",
    };
  }

  const { supabase, user } = await requireUser();
  const { winnerId } = parsed.data;

  const { data: winner, error: winnerError } = await supabase
    .from("winners")
    .select("id, user_id, verification, proof_url")
    .eq("id", winnerId)
    .maybeSingle();

  if (winnerError || !winner) {
    return { ok: false, message: "Prize claim not found." };
  }

  if (winner.user_id !== user.id) {
    return { ok: false, message: "You can only upload proof for your own prize." };
  }

  if (winner.verification === "approved") {
    return { ok: false, message: "Proof is already approved." };
  }

  const path = buildProofStoragePath(user.id, winnerId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(proofBucket())
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, message: uploadError.message };
  }

  if (winner.proof_url) {
    await supabase.storage.from(proofBucket()).remove([winner.proof_url]);
  }

  const { error: updateError } = await supabase
    .from("winners")
    .update({
      proof_url: path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", winnerId)
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  revalidatePath("/dashboard/prizes");
  revalidatePath("/admin");
  return { ok: true, message: "Screenshot uploaded — awaiting admin review." };
}

/** Signed URL for proof preview (owner or admin). */
export async function getWinnerProofSignedUrlAction(
  winnerId: string,
): Promise<WinnerActionResult> {
  const parsed = winnerIdSchema.safeParse({ winnerId });
  if (!parsed.success) {
    return { ok: false, message: "Invalid winner reference." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in required." };
  }

  const { data: winner, error } = await supabase
    .from("winners")
    .select("id, user_id, proof_url")
    .eq("id", parsed.data.winnerId)
    .maybeSingle();

  if (error || !winner?.proof_url) {
    return { ok: false, message: "Proof not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  if (winner.user_id !== user.id && !isAdmin) {
    return { ok: false, message: "Access denied." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(proofBucket())
    .createSignedUrl(winner.proof_url, 120);

  if (signError || !signed?.signedUrl) {
    return { ok: false, message: signError?.message ?? "Could not load preview." };
  }

  return { ok: true, signedUrl: signed.signedUrl };
}
