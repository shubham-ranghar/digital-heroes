"use client";

import { type ReactNode, useState, useTransition } from "react";
import { m, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

import {
  openRazorpaySubscriptionCheckout,
} from "@/components/subscription/razorpay-checkout";
import { FormError } from "@/components/auth/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSubscriptionCheckoutAction } from "@/lib/payments/actions";
import type { PlanPriceDisplay } from "@/lib/payments/prices";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";

type Plan = "monthly" | "yearly";

type SubscribePlanCheckoutProps = {
  prices: PlanPriceDisplay;
};

export function SubscribePlanCheckout({ prices }: SubscribePlanCheckoutProps) {
  const [plan, setPlan] = useState<Plan>("yearly");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  function startCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction(plan);
      if (!result.ok) {
        toast.error(result.message);
        setError(result.message);
        return;
      }

      if (result.mode === "mock") {
        window.location.href = result.redirectUrl;
        return;
      }

      try {
        await openRazorpaySubscriptionCheckout({
          ...result.checkout,
          onSuccess: () => {
            window.location.href = "/dashboard?checkout=success";
          },
          onDismiss: () => {
            toast.message("Checkout closed");
          },
        });
      } catch (checkoutError) {
        const message =
          checkoutError instanceof Error
            ? checkoutError.message
            : "Could not open checkout.";
        toast.error(message);
        setError(message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <RevealStagger trigger="mount" stagger={0.06}>
      <div
        className="grid gap-4 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Billing plan"
      >
        <RevealStaggerItem fast className="grid">
        <PlanCard
          plan="monthly"
          selected={plan === "monthly"}
          disabled={isPending}
          title="Monthly"
          priceLabel={prices.monthlyLabel}
          description="Flexible billing. Full access to draws and score tracking."
          onSelect={() => setPlan("monthly")}
          reduceMotion={reduceMotion}
        />
        </RevealStaggerItem>
        <RevealStaggerItem fast className="grid">
        <PlanCard
          plan="yearly"
          selected={plan === "yearly"}
          disabled={isPending}
          title="Yearly"
          badge="Best value"
          priceLabel={prices.yearlyLabel}
          description={
            <>
              Discounted annual plan.{" "}
              {prices.yearlySavingsHint ? (
                <span className={tabularImpact}>{prices.yearlySavingsHint}</span>
              ) : (
                <span className={tabularImpact}>Save vs 12× monthly</span>
              )}
            </>
          }
          onSelect={() => setPlan("yearly")}
          className="border-coral/40"
          reduceMotion={reduceMotion}
        />
        </RevealStaggerItem>
      </div>
      </RevealStagger>

      <FormError message={error} />
      <Button
        type="button"
        size="lg"
        className="w-full"
        loading={isPending}
        onClick={startCheckout}
      >
        {isPending ? "Starting checkout…" : "Subscribe"}
      </Button>
    </div>
  );
}

type PlanCardProps = {
  plan: Plan;
  selected: boolean;
  disabled: boolean;
  title: string;
  priceLabel: string;
  description: ReactNode;
  onSelect: () => void;
  badge?: string;
  className?: string;
  reduceMotion: boolean | null;
};

function PlanCard({
  plan,
  selected,
  disabled,
  title,
  priceLabel,
  description,
  onSelect,
  badge,
  className,
  reduceMotion,
}: PlanCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "motion-lift motion-press rounded-[20px] text-left motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:opacity-60",
        selected && "ring-2 ring-coral ring-offset-2 ring-offset-background",
      )}
    >
      <Card
        interactive={false}
        className={cn("h-full", !selected && "opacity-95", className)}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge ? (
            <m.div
              initial={false}
              animate={{ scale: selected ? 1 : 0.95, opacity: selected ? 1 : 0.7 }}
              transition={reduceMotion ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_OUT }}
            >
              <Badge className={selected ? "bg-coral text-navy" : ""}>{badge}</Badge>
            </m.div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{priceLabel}</p>
          <p>{description}</p>
          <span className="sr-only">
            {selected ? "Selected" : "Not selected"} {plan} plan
          </span>
        </CardContent>
      </Card>
    </button>
  );
}
