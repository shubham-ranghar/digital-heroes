"use server";

import { requireUser } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/stripe/env";
import { priceIdForPlan } from "@/lib/stripe/plans";
import { getStripe } from "@/lib/stripe/server";
import { getLatestSubscription } from "@/lib/subscription/access";
import { checkoutPlanSchema } from "@/lib/validations/subscription";

export type StripeActionResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function createCheckoutSessionAction(
  planInput: string,
): Promise<StripeActionResult> {
  const parsed = checkoutPlanSchema.safeParse(planInput);
  if (!parsed.success) {
    return { ok: false, message: "Choose a monthly or yearly plan." };
  }

  const { supabase, user } = await requireUser();
  const stripe = getStripe();
  const siteUrl = getSiteUrl();
  const priceId = priceIdForPlan(parsed.data);

  const existing = await getLatestSubscription(supabase, user.id);
  let customerId = existing?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/subscribe?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      plan: parsed.data,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan: parsed.data,
      },
    },
  });

  if (!session.url) {
    return { ok: false, message: "Could not start checkout. Try again." };
  }

  return { ok: true, url: session.url };
}

export async function createBillingPortalSessionAction(): Promise<StripeActionResult> {
  const { supabase, user } = await requireUser();
  const subscription = await getLatestSubscription(supabase, user.id);

  if (!subscription?.stripe_customer_id) {
    return {
      ok: false,
      message: "No billing account found. Subscribe to a plan first.",
    };
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${getSiteUrl()}/dashboard`,
  });

  return { ok: true, url: portal.url };
}
