import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigMissingState } from "@/components/ui/page-state";
import { hasStripeEnv } from "@/lib/config/env";
import { getPlanPriceDisplay } from "@/lib/stripe/prices";
import { requireUser } from "@/lib/auth/session";
import { getSubscriptionAccess } from "@/lib/subscription/access";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { tabularImpact } from "@/lib/typography";

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
  const prices = await getPlanPriceDisplay();

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
            <Badge variant="outline">Active membership</Badge>
            <p className="text-sm text-slate">
              You&apos;re subscribed
              {access.subscription?.plan
                ? ` (${access.subscription.plan})`
                : ""}
              . Manage payment method or cancel in the customer portal.
            </p>
            <CheckoutButtons showPortal />
          </div>
        ) : !hasStripeEnv() ? (
          <ConfigMissingState missing={["stripe"]} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card interactive={false}>
                <CardHeader>
                  <CardTitle className="text-base">Monthly</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{prices.monthlyLabel}</p>
                  <p>Flexible billing. Full access to draws and score tracking.</p>
                </CardContent>
              </Card>
              <Card interactive={false} className="border-coral/40">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Yearly</CardTitle>
                  <Badge>Best value</Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{prices.yearlyLabel}</p>
                  <p>
                    Discounted annual plan.{" "}
                    {prices.yearlySavingsHint ? (
                      <span className={tabularImpact}>{prices.yearlySavingsHint}</span>
                    ) : (
                      <span className={tabularImpact}>Save vs 12× monthly</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
            <CheckoutButtons />
          </>
        )}
      </div>
    </AuthShell>
  );
}
