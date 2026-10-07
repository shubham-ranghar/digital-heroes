import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell, AuthSwitchLink } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Sign in",
};

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}

export default async function LoginPage() {
  await connection();
  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track scores, view draws, and see your charity impact."
      footer={
        <AuthSwitchLink
          prompt="New here?"
          href="/signup"
          label="Create an account"
        />
      }
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
