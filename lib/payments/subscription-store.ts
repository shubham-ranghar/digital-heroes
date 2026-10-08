import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function renewalDateFromUnix(seconds: number | null | undefined): string | null {
  if (!seconds) {
    return null;
  }
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

type UpsertSubscriptionInput = {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  externalCustomerId: string | null;
  externalSubscriptionId: string;
  renewalDate: string | null;
  cancelAtPeriodEnd?: boolean;
};

export async function upsertSubscriptionRow(input: UpsertSubscriptionInput) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("external_subscription_id", input.externalSubscriptionId)
    .maybeSingle();

  const row = {
    user_id: input.userId,
    plan: input.plan,
    status: input.status,
    external_customer_id: input.externalCustomerId,
    external_subscription_id: input.externalSubscriptionId,
    renewal_date: input.renewalDate,
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await admin
      .from("subscriptions")
      .update(row)
      .eq("id", existing.id);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const { error } = await admin.from("subscriptions").insert(row);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSubscriptionStatusByExternalId(
  externalSubscriptionId: string,
  status: SubscriptionStatus,
  renewalDate?: string | null,
  options?: { cancelAtPeriodEnd?: boolean },
) {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (renewalDate !== undefined) {
    patch.renewal_date = renewalDate;
  }
  if (options?.cancelAtPeriodEnd !== undefined) {
    patch.cancel_at_period_end = options.cancelAtPeriodEnd;
  }
  const { error } = await admin
    .from("subscriptions")
    .update(patch)
    .eq("external_subscription_id", externalSubscriptionId);
  if (error) {
    throw new Error(error.message);
  }
}

/** Schedule cancel at current renewal_date; keeps status active until then. */
export async function markSubscriptionCancelAtPeriodEnd(
  externalSubscriptionId: string,
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("external_subscription_id", externalSubscriptionId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function clearSubscriptionCancelAtPeriodEnd(
  externalSubscriptionId: string,
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      cancel_at_period_end: false,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("external_subscription_id", externalSubscriptionId);
  if (error) {
    throw new Error(error.message);
  }
}
