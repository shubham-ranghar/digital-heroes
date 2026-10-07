import type Stripe from "stripe";

import { planFromPriceId } from "@/lib/stripe/plans";
import { subscriptionPeriodEnd } from "@/lib/stripe/stripe-objects";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function renewalDateFromUnix(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

export function planFromStripeSubscription(
  subscription: Stripe.Subscription,
): SubscriptionPlan {
  const metaPlan = subscription.metadata?.plan;
  if (metaPlan === "yearly" || metaPlan === "monthly") {
    return metaPlan;
  }
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    const fromPrice = planFromPriceId(priceId);
    if (fromPrice) {
      return fromPrice;
    }
  }
  return "monthly";
}

/** Map Stripe subscription state to app subscription status. */
export function mapStripeSubscriptionStatus(
  subscription: Stripe.Subscription,
): SubscriptionStatus {
  const periodEnd = subscriptionPeriodEnd(subscription);
  const now = Math.floor(Date.now() / 1000);

  if (
    subscription.status === "active" ||
    subscription.status === "trialing"
  ) {
    if (subscription.cancel_at_period_end) {
      return "cancelled";
    }
    return "active";
  }

  if (subscription.status === "canceled") {
    if (periodEnd > now) {
      return "cancelled";
    }
    return "lapsed";
  }

  if (
    subscription.status === "past_due" ||
    subscription.status === "unpaid" ||
    subscription.status === "incomplete_expired"
  ) {
    return "lapsed";
  }

  return "lapsed";
}

type UpsertSubscriptionInput = {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string;
  renewalDate: string | null;
};

export async function upsertSubscriptionRow(input: UpsertSubscriptionInput) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", input.stripeSubscriptionId)
    .maybeSingle();

  const row = {
    user_id: input.userId,
    plan: input.plan,
    status: input.status,
    stripe_customer_id: input.stripeCustomerId,
    stripe_subscription_id: input.stripeSubscriptionId,
    renewal_date: input.renewalDate,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await admin
      .from("subscriptions")
      .update(row)
      .eq("id", existing.id);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const { error } = await admin.from("subscriptions").insert(row);
  if (error) {
    throw new Error(error.message);
  }
}

export async function syncFromStripeSubscription(
  subscription: Stripe.Subscription,
  userIdOverride?: string,
) {
  const userId =
    userIdOverride ??
    subscription.metadata?.user_id ??
    subscription.metadata?.supabase_user_id;

  if (!userId) {
    throw new Error("Missing user_id on Stripe subscription metadata");
  }

  await upsertSubscriptionRow({
    userId,
    plan: planFromStripeSubscription(subscription),
    status: mapStripeSubscriptionStatus(subscription),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
    stripeSubscriptionId: subscription.id,
    renewalDate: renewalDateFromUnix(subscriptionPeriodEnd(subscription)),
  });
}

export async function markSubscriptionLapsedByStripeId(
  stripeSubscriptionId: string,
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "lapsed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}
