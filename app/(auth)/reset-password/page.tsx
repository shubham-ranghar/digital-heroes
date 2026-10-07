import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { requireUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ConfigMissingState } from "@/components/ui/page-state";

export const metadata: Metadata = {
  title: "Choose new password",
};

export const instant = false;

export default async function ResetPasswordPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <AuthShell title="Choose new password" description="Update your password.">
        <ConfigMissingState missing={["supabase"]} />
      </AuthShell>
    );
  }

  await requireUser({ loginNext: "/reset-password" });

  return (
    <AuthShell
      title="Choose a new password"
      description="Use at least eight characters. You will stay signed in after updating."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
