import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";
import { AdminSection } from "@/components/admin/admin-section";
import { getAdminReports } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Reports",
};

export const instant = false;

export default async function AdminReportsPage() {
  await connection();
  await requireAdmin();
  const reports = await getAdminReports();

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Reports</em>}
          description="Platform totals for users, prize pools, charity impact, and draw participation."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
        <AdminReportsPanel reports={reports} />
      </Reveal>
    </div>
  );
}
