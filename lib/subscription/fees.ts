import type { SubscriptionPlan } from "@/lib/subscription/types";

/** Monthly subscription fee in whole rupees (display / charity math). */
export function getMonthlySubscriptionFeeInr(): number {
  const raw = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return 499;
}

/** Fee in paise (minor units) for the member's billing period. */
export function getSubscriptionFeePaise(
  plan: SubscriptionPlan | null | undefined,
): number {
  const monthlyPaise = getMonthlySubscriptionFeeInr() * 100;
  if (plan === "yearly") {
    const yearlyRaw = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY;
    const yearly = yearlyRaw ? Number(yearlyRaw) : NaN;
    if (Number.isFinite(yearly) && yearly > 0) {
      return Math.round(yearly * 100);
    }
    return Math.round(monthlyPaise * 12 * 0.9);
  }
  return monthlyPaise;
}
