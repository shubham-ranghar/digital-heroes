"use server";

import { revalidatePath } from "next/cache";

import { actionFailure } from "@/lib/actions/failure";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type ContactAdminResult = { ok: true } | { ok: false; message: string };

export async function markContactMessageResolvedAction(
  messageId: string,
): Promise<ContactAdminResult> {
  await requireAdmin();

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("contact_messages")
      .update({ resolved: true })
      .eq("id", messageId);

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return actionFailure(error, "update the message", { exposeMessage: true });
  }

  revalidatePath("/admin/messages");
  return { ok: true };
}
