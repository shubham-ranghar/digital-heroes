"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { charityDeleteSchema, charityFormSchema } from "@/lib/validations/admin";

export type AdminMutationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function parseImageUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function revalidateCharities() {
  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  revalidatePath("/");
}

export async function saveCharityAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  const parsed = charityFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid charity data.",
    };
  }

  const admin = createAdminClient();
  const images = parseImageUrls(parsed.data.imageUrls);
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    images,
    is_featured: Boolean(parsed.data.isFeatured),
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await admin
      .from("charities")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) {
      return { ok: false, message: error.message };
    }
  } else {
    const { error } = await admin.from("charities").insert(payload);
    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidateCharities();
  return { ok: true, message: parsed.data.id ? "Charity updated." : "Charity created." };
}

export async function deleteCharityAction(
  input: unknown,
): Promise<AdminMutationResult> {
  await requireAdmin();
  const parsed = charityDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid charity reference." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("charities")
    .delete()
    .eq("id", parsed.data.charityId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23503"
          ? "Cannot delete — members are still linked to this charity."
          : error.message,
    };
  }

  revalidateCharities();
  return { ok: true, message: "Charity deleted." };
}
