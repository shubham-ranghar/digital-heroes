import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminWinnersTable } from "@/components/admin/admin-winners-table";
import {
  isPageOutOfRange,
  lastPage,
  parseTableState,
  tableStateToSearch,
  type SearchParamsRecord,
} from "@/lib/admin/pagination";
import { requireAdmin } from "@/lib/auth/session";
import { ADMIN_WINNERS_TABLE, listWinnersForAdminPage } from "@/lib/winners/queries";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Winners",
};

export const instant = false;

export default async function AdminWinnersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  await connection();
  const { supabase } = await requireAdmin();
  const table = parseTableState(await searchParams, ADMIN_WINNERS_TABLE);
  const { rows, total } = await listWinnersForAdminPage(supabase, table);

  if (isPageOutOfRange(table.page, total)) {
    redirect(`/admin/winners${tableStateToSearch({ ...table, page: lastPage(total) })}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Winners</em>}
          description="Verify proof uploads, approve or reject claims, and mark payouts as paid."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
        <AdminWinnersTable winners={rows} table={table} total={total} />
      </Reveal>
    </div>
  );
}
