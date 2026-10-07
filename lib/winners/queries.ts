import type { SupabaseClient } from "@supabase/supabase-js";

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

export async function listWinnersForAdmin(
  supabase: SupabaseClient,
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
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapWinnerWithDraw(row));
}

function mapWinnerWithDraw(row: Record<string, unknown>): WinnerWithDraw {
  const draws = row.draws as { month?: string } | null;
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
    draw_month: draws?.month ? String(draws.month) : "—",
  };
}
