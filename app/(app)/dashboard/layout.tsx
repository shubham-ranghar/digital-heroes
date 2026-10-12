import { redirect } from "next/navigation";
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

  // The member hub is for members only; admins work from the admin console.
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <DashboardChrome>
      {children}
    </DashboardChrome>
  );
}
