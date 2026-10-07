"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { charityPercentageSchema } from "@/lib/validations/charity";

export type CharityUpdateResult =
  | { ok: true; message: string; percentage: number }
  | { ok: false; message: string };

export async function updateCharityPercentageAction(
  input: unknown,
): Promise<CharityUpdateResult> {
  const parsed = charityPercentageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.flatten().fieldErrors.percentage?.[0] ?? "Invalid percentage.",
    };
  }

  const { supabase, user } = await requireUser();
  const { data: existing, error: readError } = await supabase
    .from("user_charity")
    .select("charity_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  if (!existing?.charity_id) {
    return {
      ok: false,
      message: "No charity linked yet. Pick a cause during signup or contact support.",
    };
  }

  const { error } = await supabase
    .from("user_charity")
    .update({
      percentage: parsed.data.percentage,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    message: "Charity share updated.",
    percentage: parsed.data.percentage,
  };
}
