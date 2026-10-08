import type { Metadata } from "next";
import { connection } from "next/server";

import { SettingsForm } from "@/components/dashboard/settings-form";
import { AppPageHeading } from "@/components/layout/app-page-heading";
import { getDashboardCharity } from "@/lib/dashboard/queries";
import { requireUser } from "@/lib/auth/session";
import {
  getLatestSubscription,
  getSubscriptionAccess,
} from "@/lib/subscription/access";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ConfigMissingState } from "@/components/ui/page-state";

export const metadata: Metadata = {
  title: "Settings",
};

export const instant = false;

export default async function DashboardSettingsPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <ConfigMissingState missing={["supabase"]} />
      </div>
    );
  }

  const { supabase, user } = await requireUser({ loginNext: "/dashboard/settings" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const charity = await getDashboardCharity(supabase, user.id);
  const subscription = await getLatestSubscription(supabase, user.id);
  const access = await getSubscriptionAccess(supabase, user.id);

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, slug, description, is_featured")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AppPageHeading
        label="Account"
        title={<em>Settings</em>}
        description="Update how you appear in the app, manage your charity share, and manage billing when you have an active subscription."
        className="mb-10"
      />
      <SettingsForm
        email={user.email ?? ""}
        displayName={profile?.display_name ?? null}
        charityId={charity?.charityId ?? null}
        charityPercentage={charity?.percentage ?? 10}
        charities={charities ?? []}
        hasBillingSubscription={Boolean(subscription?.external_subscription_id)}
        cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
        subscriptionStatus={subscription?.status ?? null}
        renewalDate={subscription?.renewal_date ?? null}
        hasSubscriptionAccess={access.hasAccess}
      />
    </div>
  );
}
