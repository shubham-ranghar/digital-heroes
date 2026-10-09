import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ADMIN_PAGE_SIZE,
  pageOffset,
  parsePageJson,
  type AdminTableState,
  type PageResult,
} from "@/lib/admin/pagination";
import type { WinnerRow, WinnerWithDraw } from "@/lib/winners/types";

export async function listWinnersForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<WinnerWithDraw[]> {
  const { data, error } = await supabase
    .from("winners")
    .select(
      `
      id,
      draw_id,
      user_id,
      tier,
      prize_amount,
      proof_url,
      verification,
      payment,
      created_at,
      updated_at,
      draws ( month )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapWinnerWithDraw(row));
}

/** URL params the admin Winners table accepts (see `admin_list_winners`). */
export const ADMIN_WINNERS_TABLE = {
  filters: {
    verification: ["pending", "approved", "rejected"],
    payment: ["pending", "paid"],
  },
  sorts: ["draw", "tier", "amount", "member", "verification", "payment", "created"],
} as const;

/**
 * One page of the admin Winners table. Runs under the caller's RLS, so it
 * works with an admin session alone (no service-role key).
 */
export async function listWinnersForAdminPage(
  supabase: SupabaseClient,
  state: AdminTableState,
): Promise<PageResult<WinnerWithDraw>> {
  const { data, error } = await supabase.rpc("admin_list_winners", {
    p_search: state.q || null,
    p_verification: state.filters.verification ?? null,
    p_payment: state.filters.payment ?? null,
    p_sort: state.sort ?? "created",
    p_dir: state.sort ? state.dir : "desc",
    p_limit: ADMIN_PAGE_SIZE,
    p_offset: pageOffset(state.page),
  });

  if (error) {
    throw new Error(error.message);
  }

  const { total, rows } = parsePageJson(data);
  return { total, rows: rows.map(mapWinnerWithDraw) };
}

/** Maps a winners row with either an embedded `draws` or a flat `draw_month`. */
function mapWinnerWithDraw(row: Record<string, unknown>): WinnerWithDraw {
  const draws = row.draws as { month?: string } | null | undefined;
  const month = row.draw_month ?? draws?.month;
  return {
    id: String(row.id),
    draw_id: String(row.draw_id),
    user_id: String(row.user_id),
    tier: row.tier as 3 | 4 | 5,
    prize_amount: Number(row.prize_amount),
    proof_url: row.proof_url ? String(row.proof_url) : null,
    verification: row.verification as WinnerRow["verification"],
    payment: row.payment as WinnerRow["payment"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    draw_month: month ? String(month) : "—",
    member_name: row.member_name ? String(row.member_name) : null,
    member_email: row.member_email ? String(row.member_email) : null,
  };
}
