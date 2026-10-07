"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ZodError } from "zod";

import type { AuthActionResult } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

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

export async function signInAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "Invalid login credentials"
          ? "Email or password is incorrect."
          : error.message,
    };
  }

  const nextPath = formData.get("redirect") ?? formData.get("next");
  const destination =
    typeof nextPath === "string" && nextPath.startsWith("/")
      ? nextPath
      : "/dashboard";

  revalidatePath("/dashboard");
  redirect(destination);
}

export async function signUpAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    charityId: formData.get("charityId"),
    percentage: formData.get("percentage"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data: charity, error: charityError } = await supabase
    .from("charities")
    .select("id")
    .eq("id", parsed.data.charityId)
    .maybeSingle();

  if (charityError || !charity) {
    return {
      ok: false,
      message: "That charity is no longer available. Please choose another.",
      fieldErrors: { charityId: "Invalid charity selection" },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        charity_id: parsed.data.charityId,
        charity_percentage: parsed.data.percentage,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  if (data.session && data.user) {
    const { error: charityLinkError } = await supabase.from("user_charity").upsert(
      {
        user_id: data.user.id,
        charity_id: parsed.data.charityId,
        percentage: parsed.data.percentage,
      },
      { onConflict: "user_id" },
    );

    if (charityLinkError) {
      return {
        ok: false,
        message:
          "Account created but charity preference could not be saved. Contact support.",
      };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  return {
    ok: true,
    confirmEmail: true,
    message:
      "Check your email to confirm your account. Your charity choice will be saved when you verify.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
