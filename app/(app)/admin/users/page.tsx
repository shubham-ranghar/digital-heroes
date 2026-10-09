import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import {
  isPageOutOfRange,
  lastPage,
  parseTableState,
  tableStateToSearch,
  type SearchParamsRecord,
} from "@/lib/admin/pagination";
import { ADMIN_USERS_TABLE, listAdminUsersPage } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export const instant = false;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  await connection();
  await requireAdmin();
  const table = parseTableState(await searchParams, ADMIN_USERS_TABLE);
  const { rows, total } = await listAdminUsersPage(table);

  if (isPageOutOfRange(table.page, total)) {
    redirect(`/admin/users${tableStateToSearch({ ...table, page: lastPage(total) })}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Users</em>}
          description="View and edit profiles, adjust subscriptions, and manage member scores."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
        <AdminUsersPanel users={rows} table={table} total={total} />
      </Reveal>
    </div>
  );
}
