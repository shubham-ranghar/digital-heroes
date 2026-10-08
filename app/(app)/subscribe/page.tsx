import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { SubscriptionAccessPill } from "@/components/subscription/subscription-access-pill";
import { SubscribePlanCheckout } from "@/components/subscription/subscribe-plan-checkout";
import { ConfigMissingState } from "@/components/ui/page-state";
import { hasPaymentsEnv } from "@/lib/payments/env";
import { getPlanPriceDisplay } from "@/lib/payments/prices";
import { requireUser } from "@/lib/auth/session";
import {
  getSubscriptionAccess,
  getSubscriptionAccessLabel,
} from "@/lib/subscription/access";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Subscribe",
};

export const instant = false;

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <AuthShell
        title="Choose your plan"
        description="Support your charity every month. Yearly billing is discounted — same impact, better value."
        className="max-w-lg"
      >
        <ConfigMissingState missing={["supabase"]} />
      </AuthShell>
    );
  }

  const { supabase, user } = await requireUser({ loginNext: "/subscribe" });
  const access = await getSubscriptionAccess(supabase, user.id);
  const params = await searchParams;
  const cancelled = params.checkout === "cancelled";
  const prices = getPlanPriceDisplay();
  const membershipLabel = getSubscriptionAccessLabel(
    access.subscription,
    access.hasAccess,
  );

  return (
    <AuthShell
      title="Choose your plan"
      description="Support your charity every month. Yearly billing is discounted — same impact, better value."
      className="max-w-lg"
    >
      <div className="space-y-6">
        {cancelled ? (
          <p className="rounded-xl border border-line bg-sand px-3 py-2 text-sm text-navy">
            Checkout was cancelled. Pick a plan when you&apos;re ready.
          </p>
        ) : null}

        {access.hasAccess ? (
          <div className="space-y-4">
            <SubscriptionAccessPill label={membershipLabel} />
            <p className="text-sm text-slate">
              {access.subscription?.cancel_at_period_end
                ? "You keep full access until the date above. Resume billing below if you change your mind."
                : "You're subscribed"}
              {access.subscription?.plan
                ? ` (${access.subscription.plan})`
                : ""}
              {!access.subscription?.cancel_at_period_end
                ? ". Cancel at period end from billing below."
                : null}
            </p>
            <CheckoutButtons
              showManage={Boolean(access.subscription?.external_subscription_id)}
              cancelAtPeriodEnd={access.subscription?.cancel_at_period_end ?? false}
            />
          </div>
        ) : !hasPaymentsEnv() ? (
          <ConfigMissingState missing={["payments"]} />
        ) : (
          <SubscribePlanCheckout prices={prices} />
        )}
      </div>
    </AuthShell>
  );
}
