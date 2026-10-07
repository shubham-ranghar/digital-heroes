import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import type { SubscriptionRow, SubscriptionStatus } from "@/lib/subscription/types";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Whether a subscription row grants product access (server-side). */
export function subscriptionGrantsAccess(
  subscription: Pick<SubscriptionRow, "status" | "renewal_date">,
  today = new Date(),
): boolean {
  if (subscription.status === "active") {
    return true;
  }

  if (subscription.status === "cancelled" && subscription.renewal_date) {
    const end = new Date(`${subscription.renewal_date}T23:59:59.999Z`);
    return end >= today;
  }

  return false;
}

/** Latest subscription row for a user (any status). */
export async function getLatestSubscription(
  supabase: SupabaseServer,
  userId: string,
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionRow | null;
}

export type SubscriptionAccess = {
  hasAccess: boolean;
  subscription: SubscriptionRow | null;
  isAdmin: boolean;
};

/** Resolve subscription access without redirecting. Admins always have access. */
export async function getSubscriptionAccess(
  supabase: SupabaseServer,
  userId: string,
): Promise<SubscriptionAccess> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { hasAccess: true, subscription: null, isAdmin: true };
  }

  const subscription = await getLatestSubscription(supabase, userId);
  const hasAccess = subscription
    ? subscriptionGrantsAccess(subscription)
    : false;

  return { hasAccess, subscription, isAdmin: false };
}

/**
 * Require an active subscription on protected server routes.
 * Admins bypass. Others redirect to /subscribe.
 */
export async function requireActiveSubscription() {
  const { supabase, user } = await requireUser();
  const access = await getSubscriptionAccess(supabase, user.id);

  if (!access.hasAccess) {
    redirect("/subscribe");
  }

  return { supabase, user, subscription: access.subscription, isAdmin: access.isAdmin };
}

export function isSubscriptionStatus(
  value: string,
): value is SubscriptionStatus {
  return value === "active" || value === "cancelled" || value === "lapsed";
}
