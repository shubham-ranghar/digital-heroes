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

/**
 * Days an `active` row keeps access past its `renewal_date` while the renewal
 * webhook is outstanding. After that it is treated as lapsed, so a missed or
 * never-coming renewal (or a mock subscription) can't grant access forever.
 * Mirrored in has_active_subscription() — change both together.
 */
export const RENEWAL_GRACE_DAYS = 3;

function isWithinRenewalGrace(
  renewalDate: string | null | undefined,
  today: Date,
): boolean {
  // No renewal date (e.g. an admin-created row): nothing to lapse against.
  if (!renewalDate) {
    return true;
  }
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - RENEWAL_GRACE_DAYS);
  return renewalDate >= isoDateLocal(cutoff);
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
    return isWithinRenewalGrace(subscription.renewal_date, today);
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
