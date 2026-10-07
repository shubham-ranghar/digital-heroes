import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { maskWinnerName } from "@/lib/winners/mask-name";

export type PublicWinnerListing = {
  id: string;
  drawMonth: string;
  tier: 3 | 4 | 5;
  prizeAmount: number;
  displayName: string;
};

export async function listPublicWinners(): Promise<PublicWinnerListing[]> {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  try {
    const admin = createAdminClient();

    const { data: draws, error: drawError } = await admin
      .from("draws")
      .select("id, month")
      .eq("status", "published")
      .order("month", { ascending: false });

    if (drawError || !draws?.length) {
      return [];
    }

    const drawIds = draws.map((draw) => draw.id as string);
    const monthByDraw = new Map(
      draws.map((draw) => [draw.id as string, String(draw.month)]),
    );

    const { data: winners, error: winnerError } = await admin
      .from("winners")
      .select("id, draw_id, user_id, tier, prize_amount")
      .in("draw_id", drawIds)
      .order("created_at", { ascending: false });

    if (winnerError || !winners?.length) {
      return [];
    }

    const userIds = [...new Set(winners.map((row) => row.user_id as string))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const nameByUser = new Map(
      (profiles ?? []).map((profile) => [
        profile.id as string,
        maskWinnerName(profile.display_name as string | null),
      ]),
    );

    return winners.map((row) => ({
      id: String(row.id),
      drawMonth: monthByDraw.get(String(row.draw_id)) ?? "—",
      tier: row.tier as 3 | 4 | 5,
      prizeAmount: Number(row.prize_amount),
      displayName:
        nameByUser.get(String(row.user_id)) ?? maskWinnerName(null),
    }));
  } catch {
    return [];
  }
}
