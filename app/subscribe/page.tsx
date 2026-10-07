import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigMissingState } from "@/components/ui/page-state";
import { hasStripeEnv } from "@/lib/config/env";
import { requireUser } from "@/lib/auth/session";
import { getSubscriptionAccess } from "@/lib/subscription/access";
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
  const { supabase, user } = await requireUser({ loginNext: "/subscribe" });
  const access = await getSubscriptionAccess(supabase, user.id);
  const params = await searchParams;
  const cancelled = params.checkout === "cancelled";

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
                <CardContent className="text-sm text-muted-foreground">
                  Flexible billing. Full access to draws and score tracking.
                </CardContent>
              </Card>
              <Card interactive={false} className="border-coral/40">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Yearly</CardTitle>
                  <Badge>Best value</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Discounted annual plan.{" "}
                  <span className={tabularImpact}>Save vs 12× monthly</span>{" "}
                  (price set in Stripe).
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
