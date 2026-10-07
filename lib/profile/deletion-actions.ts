"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import type { ProfileActionResult } from "@/lib/profile/actions";

export async function requestAccountDeletionAction(): Promise<ProfileActionResult> {
  const { supabase, user } = await requireUser({
    loginNext: "/dashboard/settings",
  });

  const { error } = await supabase.from("account_deletion_requests").upsert(
    {
      user_id: user.id,
      status: "pending",
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42P01"
          ? "Deletion requests are not available yet. Contact support."
          : error.message,
    };
  }

  revalidatePath("/dashboard/settings");
  return {
    ok: true,
    message:
      "Deletion request received. Our team will confirm by email before any data is removed.",
  };
}
