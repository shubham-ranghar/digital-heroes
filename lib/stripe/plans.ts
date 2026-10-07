import type { SubscriptionPlan } from "@/lib/subscription/types";
import { getStripePriceIds } from "@/lib/stripe/env";

export function priceIdForPlan(plan: SubscriptionPlan) {
  const ids = getStripePriceIds();
  return plan === "yearly" ? ids.yearly : ids.monthly;
}

export function planFromPriceId(priceId: string): SubscriptionPlan | null {
  const ids = getStripePriceIds();
  if (priceId === ids.monthly) {
    return "monthly";
  }
  if (priceId === ids.yearly) {
    return "yearly";
  }
  return null;
}
