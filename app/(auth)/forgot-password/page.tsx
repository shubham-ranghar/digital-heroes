import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell, AuthSwitchLink } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Forgot password",
};

export const instant = false;

export default async function ForgotPasswordPage() {
  await connection();
  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we will send a secure link to choose a new password."
      footer={
        <AuthSwitchLink prompt="Remembered it?" href="/login" label="Back to sign in" />
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
