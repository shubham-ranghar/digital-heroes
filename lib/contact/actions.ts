"use server";

import type { ZodError } from "zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  message: z
    .string()
    .trim()
    .min(10, "Please add a bit more detail (at least 10 characters)")
    .max(4000),
});

export type ContactActionResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

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

export async function submitContactMessageAction(
  formData: FormData,
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42P01"
          ? "Contact form is temporarily unavailable. Email us from the footer when available."
          : error.message,
    };
  }

  return {
    ok: true,
    message: "Thanks — we received your message and will reply soon.",
  };
}
