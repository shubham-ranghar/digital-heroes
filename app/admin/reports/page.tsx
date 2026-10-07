import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";
import { AdminSection } from "@/components/admin/admin-section";
import { getAdminReports } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Admin · Reports",
};

export const instant = false;

export default async function AdminReportsPage() {
  await connection();
  const reports = await getAdminReports();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSection
        title="Reports"
        description="Platform totals for users, prize pools, charity impact, and draw participation."
      />
      <AdminReportsPanel reports={reports} />
    </div>
  );
}
