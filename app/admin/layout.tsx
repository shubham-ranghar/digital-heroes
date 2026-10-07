import { connection } from "next/server";

import { AdminChrome } from "@/components/layout/admin-chrome";
import { hasAdminServiceRole } from "@/lib/config/env";
import { requireAdmin } from "@/lib/auth/session";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const { user } = await requireAdmin();

  return (
    <AdminChrome
      adminEmail={user.email}
      showServiceRoleWarning={!hasAdminServiceRole()}
    >
      {children}
    </AdminChrome>
  );
}
