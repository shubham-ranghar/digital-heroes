import type { SubscriptionStatus } from "@/lib/subscription/types";

import type { RazorpaySubscriptionEntity } from "@/lib/payments/types";

/** Map Razorpay subscription entity status to app subscription status. */
export function mapRazorpaySubscriptionStatus(
  subscription: RazorpaySubscriptionEntity,
  now = Math.floor(Date.now() / 1000),
): SubscriptionStatus {
  const status = subscription.status?.toLowerCase() ?? "";
  const periodEnd = subscription.current_end ?? subscription.ended_at ?? 0;

  if (status === "active" || status === "authenticated") {
    return "active";
  }

  if (status === "halted" || status === "completed" || status === "expired") {
    return "lapsed";
  }

  if (status === "cancelled") {
    if (periodEnd > now) {
      return "cancelled";
    }
    return "lapsed";
  }

  if (status === "pending") {
    return "past_due";
  }

  return "lapsed";
}
