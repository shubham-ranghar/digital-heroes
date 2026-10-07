"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createBillingPortalSessionAction,
  createCheckoutSessionAction,
} from "@/lib/stripe/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/form-message";

type CheckoutButtonsProps = {
  showPortal?: boolean;
};

export function CheckoutButtons({ showPortal = false }: CheckoutButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCheckout(plan: "monthly" | "yearly") {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSessionAction(plan);
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      toast.error(result.message);
      setError(result.message);
    });
  }

  function openPortal() {
    setError(null);
    startTransition(async () => {
      const result = await createBillingPortalSessionAction();
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      toast.error(result.message);
      setError(result.message);
    });
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={isPending}
          onClick={() => startCheckout("monthly")}
        >
          Monthly checkout
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={isPending}
          onClick={() => startCheckout("yearly")}
        >
          Yearly checkout
        </Button>
      </div>
      {showPortal ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isPending}
          onClick={openPortal}
        >
          Manage billing in Stripe
        </Button>
      ) : null}
    </div>
  );
}
