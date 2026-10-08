import type { SubscriptionRow, SubscriptionStatus } from "@/lib/subscription/types";

function isoDateLocal(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isOnOrBeforePeriodEnd(
  renewalDate: string | null | undefined,
  today: Date,
): boolean {
  if (!renewalDate) {
    return false;
  }
  return renewalDate >= isoDateLocal(today);
}

/** Whether a subscription row grants product access (mirrors has_active_subscription RLS). */
export function subscriptionGrantsAccess(
  subscription: Pick<
    SubscriptionRow,
    "status" | "renewal_date" | "cancel_at_period_end"
  >,
  today = new Date(),
): boolean {
  const cancelAtEnd = Boolean(subscription.cancel_at_period_end);

  if (subscription.status === "active") {
    if (cancelAtEnd) {
      return isOnOrBeforePeriodEnd(subscription.renewal_date, today);
    }
    return true;
  }

  if (subscription.status === "cancelled") {
    return isOnOrBeforePeriodEnd(subscription.renewal_date, today);
  }

  return false;
}

export type SubscriptionAccessLabel =
  | { tone: "active"; label: string }
  | { tone: "cancelling"; label: string }
  | { tone: "inactive"; label: string };

/** User-facing membership label for dashboard, settings, and admin. */
export function getSubscriptionAccessLabel(
  subscription: Pick<
    SubscriptionRow,
    "status" | "renewal_date" | "cancel_at_period_end"
  > | null,
  hasAccess: boolean,
): SubscriptionAccessLabel {
  if (!subscription || !hasAccess) {
    if (subscription?.status === "lapsed") {
      return { tone: "inactive", label: "Lapsed" };
    }
    return { tone: "inactive", label: "Inactive" };
  }

  if (subscription.cancel_at_period_end && subscription.renewal_date) {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(`${subscription.renewal_date}T12:00:00`));
    return {
      tone: "cancelling",
      label: `Active, cancels on ${formatted}`,
    };
  }

  return { tone: "active", label: "Active" };
}

export function isSubscriptionStatus(
  value: string,
): value is SubscriptionStatus {
  return (
    value === "active" ||
    value === "cancelled" ||
    value === "lapsed" ||
    value === "past_due"
  );
}
