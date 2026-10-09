import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { subscriptionGrantsAccess } from "@/lib/subscription/grants";
import type { SubscriptionRow } from "@/lib/subscription/types";
import type { createClient } from "@/lib/supabase/server";

export {
  getSubscriptionAccessLabel,
  isSubscriptionStatus,
  subscriptionGrantsAccess,
  type SubscriptionAccessLabel,
} from "@/lib/subscription/grants";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

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
  // Both reads in parallel: this sits on the critical path of /subscribe and
  // the dashboard, and the subscription read is wasted only for admins.
  const [{ data: profile }, subscription] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    getLatestSubscription(supabase, userId),
  ]);

  if (profile?.role === "admin") {
    return { hasAccess: true, subscription: null, isAdmin: true };
  }

  const hasAccess = subscription
    ? subscriptionGrantsAccess({
        status: subscription.status,
        renewal_date: subscription.renewal_date,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      })
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

