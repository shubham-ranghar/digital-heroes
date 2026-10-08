"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { FieldError, FormError, FormSuccess } from "@/components/auth/form-message";
import { resetPasswordAction } from "@/lib/auth/password-actions";
import type { AuthActionResult } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await resetPasswordAction(formData);
      setResult(response);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormError message={result?.ok === false ? result.message : undefined} />
      <FormSuccess message={result?.ok ? result.message : undefined} />

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          disabled={isPending}
          aria-invalid={Boolean(result?.fieldErrors?.password)}
        />
        <FieldError message={result?.fieldErrors?.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          disabled={isPending}
          aria-invalid={Boolean(result?.fieldErrors?.confirmPassword)}
        />
        <FieldError message={result?.fieldErrors?.confirmPassword} />
      </div>

      <Button type="submit" className="h-12 w-full" loading={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </Button>

      {result?.ok ? (
        <p className="text-center text-sm text-muted-on-surface">
          <Link href="/login" className="auth-inline-link font-medium">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </form>
  );
}
