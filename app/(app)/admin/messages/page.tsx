import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminMessagesPanel } from "@/components/admin/admin-messages-panel";
import {
  isPageOutOfRange,
  lastPage,
  parseTableState,
  tableStateToSearch,
  type PageResult,
  type SearchParamsRecord,
} from "@/lib/admin/pagination";
import { requireAdmin } from "@/lib/auth/session";
import {
  ADMIN_MESSAGES_TABLE,
  listContactMessagesAdminPage,
  type AdminContactMessage,
} from "@/lib/contact/admin-queries";

export const metadata: Metadata = {
  title: "Contact messages",
};

export const instant = false;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  await connection();
  await requireAdmin();
  const table = parseTableState(await searchParams, ADMIN_MESSAGES_TABLE);

  let result: PageResult<AdminContactMessage> = { rows: [], total: 0 };
  try {
    result = await listContactMessagesAdminPage(table);
  } catch {
    result = { rows: [], total: 0 };
  }

  if (isPageOutOfRange(table.page, result.total)) {
    redirect(
      `/admin/messages${tableStateToSearch({ ...table, page: lastPage(result.total) })}`,
    );
  }

  return (
    <AdminMessagesPanel messages={result.rows} table={table} total={result.total} />
  );
}
