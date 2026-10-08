"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError, FormError } from "@/components/auth/form-message";
import { signInAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo =
    searchParams.get("redirect") ??
    searchParams.get("next") ??
    "/dashboard";
  const callbackError = searchParams.get("error") === "auth_callback";

  const [result, setResult] = useState<AuthActionResult | null>(
    callbackError
      ? {
          ok: false,
          message: "Sign-in link expired or is invalid. Try logging in again.",
        }
      : null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("redirect", redirectTo);

    startTransition(async () => {
      const response = await signInAction(formData);
      if (response && !response.ok && response.message) {
        toast.error(response.message);
      }
      setResult(response);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormError message={result?.ok === false ? result.message : undefined} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(result?.fieldErrors?.email)}
          disabled={isPending}
          required
        />
        <FieldError message={result?.fieldErrors?.email} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="auth-inline-link text-xs font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={Boolean(result?.fieldErrors?.password)}
          disabled={isPending}
          required
        />
        <FieldError message={result?.fieldErrors?.password} />
      </div>

      <Button type="submit" className="h-12 w-full" loading={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
