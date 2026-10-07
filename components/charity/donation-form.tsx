"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { FieldError, FormError } from "@/components/auth/form-message";
import { createDonationCheckoutAction } from "@/lib/stripe/donation-actions";
import { donationCheckoutSchema } from "@/lib/validations/donation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tabularImpact } from "@/lib/typography";

const PRESETS = [5, 10, 25, 50] as const;

type DonationFormProps = {
  charityId: string;
  charitySlug: string;
  charityName: string;
  isLoggedIn: boolean;
};

export function DonationForm({
  charityId,
  charitySlug,
  charityName,
  isLoggedIn,
}: DonationFormProps) {
  const [amount, setAmount] = useState<string>("10");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-line bg-navy/30 px-4 py-5 text-sm text-slate">
        <p className="mb-3">
          Sign in to make a one-off donation to {charityName}. Gifts are
          separate from membership and prize draws.
        </p>
        <Button
          size="sm"
          render={
            <Link
              href={`/login?next=${encodeURIComponent(`/charities/${charitySlug}`)}`}
            />
          }
        >
          Sign in to donate
        </Button>
      </div>
    );
  }

  function submit() {
    setError(null);
    setFieldErrors({});

    const parsed = donationCheckoutSchema.safeParse({
      charityId,
      amount,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({ amount: flat.amount?.[0] });
      return;
    }

    startTransition(async () => {
      const result = await createDonationCheckoutAction(parsed.data);
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      setError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
    });
  }

  return (
    <div className="space-y-4 rounded-[20px] border border-status-active/30 bg-status-active/10 p-5">
      <div>
        <h3 className="font-sans text-lg font-semibold text-navy">
          One-off donation
        </h3>
        <p className="mt-1 text-sm text-slate">
          Independent of your subscription and gameplay — goes directly to this
          cause via Stripe.
        </p>
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={amount === String(preset) ? "default" : "outline"}
            className={tabularImpact}
            onClick={() => setAmount(String(preset))}
            disabled={isPending}
          >
            £{preset}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="donation-amount" className="text-sm font-medium text-navy">
          Custom amount (£)
        </label>
        <Input
          id="donation-amount"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="bg-cream/50 text-navy"
          disabled={isPending}
        />
        <FieldError message={fieldErrors.amount} />
      </div>

      <Button type="button" className="w-full" disabled={isPending} onClick={submit}>
        {isPending ? "Opening checkout…" : "Donate with Stripe"}
      </Button>
    </div>
  );
}
