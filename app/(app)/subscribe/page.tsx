import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { SubscriptionAccessPill } from "@/components/subscription/subscription-access-pill";
import { SubscribePlanCheckout } from "@/components/subscription/subscribe-plan-checkout";
import { ConfigMissingState } from "@/components/ui/page-state";
import { hasPaymentsEnv } from "@/lib/payments/env";
import { getPlanPriceDisplay, type PlanPriceDisplay } from "@/lib/payments/prices";
import { requireUser } from "@/lib/auth/session";
import {
  getSubscriptionAccess,
  getSubscriptionAccessLabel,
} from "@/lib/subscription/access";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { editorialAppTitleVoice } from "@/lib/typography-editorial";

const TITLE = (
  <>
    Choose your <em>plan</em>
  </>
);

const DESCRIPTION =
  "Support your charity every month. Yearly billing is discounted — same impact, better value.";

export const metadata: Metadata = {
  title: "Subscribe",
};

export const instant = false;

type SubscribeSearchParams = Promise<{ checkout?: string }>;

/**
 * The heading, plan cards and prices depend only on env, so they render in
 * the static shell that `/subscribe` links prefetch: clicking Subscribe shows
 * the real page at once instead of a full-page skeleton. Only the per-member
 * part (signed in? already subscribed?) streams in, behind a fallback that is
 * the same plan picker with checkout disabled, so nothing shifts.
 */
export default function SubscribePage({
  searchParams,
}: {
  searchParams: SubscribeSearchParams;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <AuthShell
        eyebrow="Membership"
        title={TITLE}
        titleClassName={editorialAppTitleVoice}
        description={DESCRIPTION}
        className="max-w-lg"
      >
        <ConfigMissingState missing={["supabase"]} />
      </AuthShell>
    );
  }

  const prices = getPlanPriceDisplay();
  const paymentsReady = hasPaymentsEnv();

  return (
    <AuthShell
      eyebrow="Membership"
      title={TITLE}
      titleClassName={editorialAppTitleVoice}
      description={DESCRIPTION}
      className="max-w-lg"
    >
      <Suspense
        fallback={
          paymentsReady ? (
            <SubscribePlanCheckout prices={prices} checking />
          ) : (
            <ConfigMissingState missing={["payments"]} />
          )
        }
      >
        <SubscribeMembership
          searchParams={searchParams}
          prices={prices}
          paymentsReady={paymentsReady}
        />
      </Suspense>
    </AuthShell>
  );
}

async function SubscribeMembership({
  searchParams,
  prices,
  paymentsReady,
}: {
  searchParams: SubscribeSearchParams;
  prices: PlanPriceDisplay;
  paymentsReady: boolean;
}) {
  await connection();

  const { supabase, user } = await requireUser({ loginNext: "/subscribe" });
  const access = await getSubscriptionAccess(supabase, user.id);
  const params = await searchParams;
  const cancelled = params.checkout === "cancelled";
  const membershipLabel = getSubscriptionAccessLabel(
    access.subscription,
    access.hasAccess,
  );

  return (
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
      ) : !paymentsReady ? (
        <ConfigMissingState missing={["payments"]} />
      ) : (
        <SubscribePlanCheckout prices={prices} />
      )}
    </div>
  );
}
