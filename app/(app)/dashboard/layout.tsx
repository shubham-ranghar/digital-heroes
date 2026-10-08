import { connection } from "next/server";

import { DashboardChrome } from "@/components/layout/dashboard-chrome";
import { requireUser } from "@/lib/auth/session";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardChrome isAdmin={profile?.role === "admin"}>
      {children}
    </DashboardChrome>
  );
}
