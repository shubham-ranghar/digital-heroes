import type { PaymentProviderName } from "@/lib/payments/types";
import type { SubscriptionPlan } from "@/lib/subscription/types";

export function getPaymentProviderName(): PaymentProviderName {
  const value = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (value === "mock") {
    return "mock";
  }
  return "razorpay";
}

export function hasRazorpayEnv(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PLAN_ID_MONTHLY &&
      process.env.RAZORPAY_PLAN_ID_YEARLY &&
      process.env.RAZORPAY_WEBHOOK_SECRET,
  );
}

export function hasPaymentsEnv(): boolean {
  if (getPaymentProviderName() === "mock") {
    return true;
  }
  return hasRazorpayEnv();
}

export function getRazorpayKeyId() {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error("Missing RAZORPAY_KEY_ID");
  }
  return key;
}

export function getRazorpayKeySecret() {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET");
  }
  return secret;
}

export function getRazorpayWebhookSecret() {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
  }
  return secret;
}

export function razorpayPlanIdForPlan(plan: SubscriptionPlan): string {
  const monthly = process.env.RAZORPAY_PLAN_ID_MONTHLY;
  const yearly = process.env.RAZORPAY_PLAN_ID_YEARLY;
  if (!monthly || !yearly) {
    throw new Error(
      "Missing RAZORPAY_PLAN_ID_MONTHLY or RAZORPAY_PLAN_ID_YEARLY",
    );
  }
  return plan === "yearly" ? yearly : monthly;
}

export function planFromRazorpayPlanId(planId: string): SubscriptionPlan {
  const yearly = process.env.RAZORPAY_PLAN_ID_YEARLY;
  if (yearly && planId === yearly) {
    return "yearly";
  }
  return "monthly";
}
