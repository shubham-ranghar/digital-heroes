"use client";

import { useState, useTransition } from "react";

import { FieldError, FormError, FormSuccess } from "@/components/auth/form-message";
import { forgotPasswordAction } from "@/lib/auth/password-actions";
import type { AuthActionResult } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await forgotPasswordAction(formData);
      setResult(response);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormError message={result?.ok === false ? result.message : undefined} />
      <FormSuccess message={result?.ok ? result.message : undefined} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          aria-invalid={Boolean(result?.fieldErrors?.email)}
        />
        <FieldError message={result?.fieldErrors?.email} />
      </div>

      <Button type="submit" className="h-12 w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
