"use server";

import { requireUser } from "@/lib/auth/session";
import { getPaymentProvider, hasPaymentsEnv } from "@/lib/payments";
import { RazorpayApiError } from "@/lib/payments/razorpay-client";
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
  try {
    const result = await provider.createSubscription({
      userId: user.id,
      email: user.email,
      plan: parsed.data,
    });

    if (result.mode === "mock") {
      return { ok: true, mode: "mock", redirectUrl: result.redirectUrl };
    }

    return { ok: true, mode: "razorpay", checkout: result.checkout };
  } catch (error) {
    return { ok: false, message: paymentErrorMessage(error, "start checkout") };
  }
}

/**
 * Provider failures become `{ ok: false }` results, never throws that would
 * blow up the page. `RazorpayApiError` descriptions are already written for
 * people, so they pass through; anything else gets a generic line.
 */
function paymentErrorMessage(error: unknown, doing: string): string {
  console.error(`Payment provider error while trying to ${doing}:`, error);
  if (error instanceof RazorpayApiError) {
    return `Payment provider error: ${error.message}`;
  }
  if (error instanceof Error && error.message.includes("Razorpay plan")) {
    // Plan misconfiguration raised by our own validation — actionable as-is.
    return error.message;
  }
  return `We could not ${doing} right now. Please try again in a moment.`;
}

export type CancelSubscriptionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function cancelSubscriptionAction(): Promise<CancelSubscriptionResult> {
  const { supabase, user } = await requireUser();
  const subscription = await getLatestSubscription(supabase, user.id);

  if (!subscription?.external_subscription_id) {
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
  try {
    await provider.cancelSubscription(subscription.external_subscription_id);
  } catch (error) {
    return { ok: false, message: paymentErrorMessage(error, "schedule the cancellation") };
  }

  return {
    ok: true,
    message: "Your subscription will cancel at the end of the current billing period.",
  };
}

export type ResumeSubscriptionResult = CancelSubscriptionResult;

export async function resumeSubscriptionAction(): Promise<ResumeSubscriptionResult> {
  const { supabase, user } = await requireUser();
  const subscription = await getLatestSubscription(supabase, user.id);

  if (!subscription?.external_subscription_id) {
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
  try {
    await provider.resumeSubscription(subscription.external_subscription_id);
  } catch (error) {
    return { ok: false, message: paymentErrorMessage(error, "resume the subscription") };
  }

  return {
    ok: true,
    message: "Subscription resumed. Billing will continue as usual.",
  };
}
