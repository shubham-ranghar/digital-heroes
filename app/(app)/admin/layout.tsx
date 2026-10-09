import { connection } from "next/server";

import { AdminChrome } from "@/components/layout/admin-chrome";
import { LayoutMotionFeatures } from "@/components/providers/motion-features";
import { hasAdminServiceRole } from "@/lib/config/env";
import { requireAdmin } from "@/lib/auth/session";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const { supabase, user } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  // Identity in chrome is the display name (or the email's local part) plus a
  // role label; the full email lives in Settings only.
  const adminName =
    profile?.display_name?.trim() || user.email?.split("@")[0] || null;

  return (
    <LayoutMotionFeatures>
      <AdminChrome
        adminName={adminName}
        showServiceRoleWarning={!hasAdminServiceRole()}
      >
        {children}
      </AdminChrome>
    </LayoutMotionFeatures>
  );
}
