"use server";

import type { ZodError } from "zod";

import type { AuthActionResult } from "@/lib/auth/types";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/stripe/env";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/password";

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

export async function forgotPasswordAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message:
      "If an account exists for that email, we sent a link to reset your password.",
  };
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: "Password updated. You can sign in with your new password.",
  };
}

export async function changePasswordAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  await requireUser({ loginNext: "/dashboard/settings" });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Password updated." };
}
