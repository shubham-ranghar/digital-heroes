"use server";

import { requireUser } from "@/lib/auth/session";
import { getPaymentProvider, hasPaymentsEnv } from "@/lib/payments";
import { getLatestSubscription } from "@/lib/subscription/access";
import { checkoutPlanSchema } from "@/lib/validations/subscription";

export type PaymentActionResult =
  | {
      ok: true;
      mode: "razorpay";
      checkout: {
        keyId: string;
        subscriptionId: string;
        name: string;
        description: string;
        prefill?: { email?: string; name?: string };
      };
    }
  | { ok: true; mode: "mock"; redirectUrl: string }
  | { ok: false; message: string };

export async function createSubscriptionCheckoutAction(
  planInput: string,
): Promise<PaymentActionResult> {
  if (!hasPaymentsEnv()) {
    return {
      ok: false,
      message: "Payments are not configured. Set PAYMENT_PROVIDER and Razorpay env vars.",
    };
  }

  const parsed = checkoutPlanSchema.safeParse(planInput);
  if (!parsed.success) {
    return { ok: false, message: "Choose a monthly or yearly plan." };
  }

  const { user } = await requireUser();
  const provider = getPaymentProvider();
  const result = await provider.createSubscription({
    userId: user.id,
    email: user.email,
    plan: parsed.data,
  });

  if (result.mode === "mock") {
    return { ok: true, mode: "mock", redirectUrl: result.redirectUrl };
  }

  return { ok: true, mode: "razorpay", checkout: result.checkout };
}

export type CancelSubscriptionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function cancelSubscriptionAction(): Promise<CancelSubscriptionResult> {
  const { supabase, user } = await requireUser();
  const subscription = await getLatestSubscription(supabase, user.id);

  if (!subscription?.stripe_subscription_id) {
    return {
      ok: false,
      message: "No subscription found. Subscribe to a plan first.",
    };
  }

  if (subscription.cancel_at_period_end) {
    return {
      ok: false,
      message: "Cancellation is already scheduled for this billing period.",
    };
  }

  const provider = getPaymentProvider();
  await provider.cancelSubscription(subscription.stripe_subscription_id);

  return {
    ok: true,
    message: "Your subscription will cancel at the end of the current billing period.",
  };
}

export type ResumeSubscriptionResult = CancelSubscriptionResult;

export async function resumeSubscriptionAction(): Promise<ResumeSubscriptionResult> {
  const { supabase, user } = await requireUser();
  const subscription = await getLatestSubscription(supabase, user.id);

  if (!subscription?.stripe_subscription_id) {
    return {
      ok: false,
      message: "No subscription found.",
    };
  }

  if (!subscription.cancel_at_period_end) {
    return {
      ok: false,
      message: "This subscription is not scheduled to cancel.",
    };
  }

  const provider = getPaymentProvider();
  await provider.resumeSubscription(subscription.stripe_subscription_id);

  return {
    ok: true,
    message: "Subscription resumed. Billing will continue as usual.",
  };
}
