"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markContactMessageResolvedAction(messageId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ resolved: true })
    .eq("id", messageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/messages");
}
