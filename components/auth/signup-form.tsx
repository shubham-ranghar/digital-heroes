"use client";

import { useState, useTransition } from "react";

import { FieldError, FormError, FormSuccess } from "@/components/auth/form-message";
import { signUpAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type CharityOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_featured: boolean;
};

const DEFAULT_PERCENTAGE = 10;

export function SignupForm({ charities }: { charities: CharityOption[] }) {
  const [charityId, setCharityId] = useState(charities[0]?.id ?? "");
  const [percentage, setPercentage] = useState(DEFAULT_PERCENTAGE);
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("charityId", charityId);
    formData.set("percentage", String(percentage));

    startTransition(async () => {
      const response = await signUpAction(formData);
      setResult(response);
    });
  }

  if (charities.length === 0) {
    return (
      <FormError
        message="No charities are available yet. Please check back soon or contact support."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormError message={result?.ok === false ? result.message : undefined} />
      <FormSuccess
        message={
          result?.ok && result.confirmEmail ? result.message : undefined
        }
      />

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
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(result?.fieldErrors?.password)}
          disabled={isPending}
          required
        />
        <FieldError message={result?.fieldErrors?.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="charityId">Your charity</Label>
        <Select
          value={charityId}
          onValueChange={(value) => {
            if (value) {
              setCharityId(value);
            }
          }}
          disabled={isPending}
        >
          <SelectTrigger id="charityId" className="h-12 w-full">
            <SelectValue placeholder="Choose a cause" />
          </SelectTrigger>
          <SelectContent>
            {charities.map((charity) => (
              <SelectItem key={charity.id} value={charity.id}>
                {charity.name}
                {charity.is_featured ? " · Featured" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={result?.fieldErrors?.charityId} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="percentage">Subscription share to charity</Label>
          <span className="font-sans text-lg tabular-impact text-coral-deep">
            {percentage}%
          </span>
        </div>
        <Slider
          id="percentage"
          min={10}
          max={100}
          step={1}
          value={[percentage]}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            setPercentage(next ?? DEFAULT_PERCENTAGE);
          }}
          disabled={isPending}
          aria-label="Charity contribution percentage"
        />
        <p className="text-xs text-muted-on-surface">
          Minimum 10% of your subscription fee. You can increase anytime in your
          dashboard.
        </p>
        <FieldError message={result?.fieldErrors?.percentage} />
      </div>

      <Button type="submit" className="h-12 w-full" loading={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
