"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  displayNameSchema,
  profileCharitySchema,
} from "@/lib/validations/profile";

export type ProfileActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> };

export async function updateDisplayNameAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const parsed = displayNameSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: fieldErrors.displayName?.[0] ?? "Invalid display name.",
      fieldErrors: {
        displayName: fieldErrors.displayName?.[0],
      },
    };
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Display name updated." };
}

export async function updateProfileCharityAction(
  input: unknown,
): Promise<ProfileActionResult & { percentage?: number }> {
  const parsed = profileCharitySchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message:
        flat.percentage?.[0] ??
        flat.charityId?.[0] ??
        "Check your charity selection.",
      fieldErrors: {
        charityId: flat.charityId?.[0],
        percentage: flat.percentage?.[0],
      },
    };
  }

  const { supabase, user } = await requireUser();

  const { data: charity, error: charityError } = await supabase
    .from("charities")
    .select("id")
    .eq("id", parsed.data.charityId)
    .maybeSingle();

  if (charityError || !charity) {
    return {
      ok: false,
      message: "That charity is no longer available. Choose another.",
      fieldErrors: { charityId: "Invalid charity" },
    };
  }

  const { error } = await supabase.from("user_charity").upsert(
    {
      user_id: user.id,
      charity_id: parsed.data.charityId,
      percentage: parsed.data.percentage,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return {
    ok: true,
    message: "Charity preference updated.",
    percentage: parsed.data.percentage,
  };
}
