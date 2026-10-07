import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminWinnersTable } from "@/components/admin/admin-winners-table";
import { requireAdmin } from "@/lib/auth/session";
import { listWinnersForAdmin } from "@/lib/winners/queries";

export const metadata: Metadata = {
  title: "Admin · Winners",
};

export const instant = false;

export default async function AdminWinnersPage() {
  await connection();
  const { supabase } = await requireAdmin();
  const winners = await listWinnersForAdmin(supabase);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSection
        title="Winners"
        description="Verify proof uploads, approve or reject claims, and mark payouts as paid."
      />
      <AdminWinnersTable winners={winners} />
    </div>
  );
}
