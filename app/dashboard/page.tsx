import type { Metadata } from "next";
import { connection } from "next/server";

import { CheckoutToast } from "@/components/dashboard/checkout-toast";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import {
  getDashboardCharity,
  getDashboardParticipation,
  getDashboardScores,
  getDashboardWinnings,
} from "@/lib/dashboard/queries";
import { requireUser, getSubscriptionAccess } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  await connection();
  const { supabase, user } = await requireUser();
  const access = await getSubscriptionAccess(supabase, user.id);
  const params = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const [charity, participation, winnings] = await Promise.all([
    getDashboardCharity(supabase, user.id),
    getDashboardParticipation(supabase, user.id),
    getDashboardWinnings(supabase, user.id),
  ]);

  const scores =
    access.hasAccess ? await getDashboardScores(supabase, user.id) : [];

  const statusLabel = access.subscription?.status ?? "none";

  return (
    <>
      <CheckoutToast checkout={params.checkout} hasAccess={access.hasAccess} />
      <DashboardHome
        displayName={profile?.display_name ?? null}
        email={user.email ?? ""}
        hasAccess={access.hasAccess}
        isAdmin={access.isAdmin}
        plan={access.subscription?.plan ?? null}
        status={statusLabel}
        renewalDate={access.subscription?.renewal_date ?? null}
        charity={charity}
        scores={scores}
        participation={participation}
        winnings={winnings}
      />
    </>
  );
}
