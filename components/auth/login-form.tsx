"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { signInAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, FormError } from "@/components/auth/form-message";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
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
    formData.set("next", next);

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
      <FormError message={result?.message} />

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-navy">
          Email
        </label>
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
        <label htmlFor="password" className="text-sm font-medium text-navy">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(result?.fieldErrors?.password)}
          disabled={isPending}
          required
        />
        <FieldError message={result?.fieldErrors?.password} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
