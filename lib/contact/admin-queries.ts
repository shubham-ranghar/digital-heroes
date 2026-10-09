import {
  ADMIN_PAGE_SIZE,
  ilikeAnyOf,
  pageOffset,
  type AdminTableState,
  type PageResult,
} from "@/lib/admin/pagination";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  createdAt: string;
};

/** URL params the admin Messages list accepts. */
export const ADMIN_MESSAGES_TABLE = {
  filters: { status: ["unresolved", "resolved"] },
} as const;

/** One page of contact messages, newest first. */
export async function listContactMessagesAdminPage(
  state: AdminTableState,
): Promise<PageResult<AdminContactMessage>> {
  const admin = createAdminClient();

  const filtered = (head: boolean) => {
    let query = admin
      .from("contact_messages")
      .select("id, name, email, message, resolved, created_at", {
        count: "exact",
        head,
      });
    if (state.filters.status) {
      query = query.eq("resolved", state.filters.status === "resolved");
    }
    if (state.q) {
      query = query.or(ilikeAnyOf(["name", "email", "message"], state.q));
    }
    return query;
  };

  const from = pageOffset(state.page);
  const { data, error, count } = await filtered(false)
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  if (error) {
    // PostgREST rejects a range past the end; report the real total so the
    // page can send the admin back to the last page.
    if (error.code === "PGRST103") {
      const { count: total } = await filtered(true);
      return { rows: [], total: total ?? 0 };
    }
    throw new Error(error.message);
  }

  return {
    total: count ?? 0,
    rows: (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      message: String(row.message),
      resolved: Boolean(row.resolved),
      createdAt: String(row.created_at),
    })),
  };
}

export async function countUnreadContactMessages(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false);

    if (error) {
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}
