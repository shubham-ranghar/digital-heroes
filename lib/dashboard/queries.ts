import type { SupabaseClient } from "@supabase/supabase-js";

import type { ScoreRow } from "@/lib/scores/types";

export type DashboardCharity = {
  charityId: string;
  name: string;
  slug: string;
  percentage: number;
} | null;

export type DashboardParticipation = {
  drawsEntered: number;
  upcomingDrawMonth: string | null;
  upcomingDrawStatus: string | null;
};

export type DashboardWinnings = {
  totalWon: number;
  winCount: number;
  paymentPill: "none" | "pending" | "paid";
};

function firstDayOfMonthIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function formatDrawMonthLabel(monthIso: string): string {
  const date = new Date(`${monthIso}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function getDashboardCharity(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardCharity> {
  const { data, error } = await supabase
    .from("user_charity")
    .select("percentage, charity_id, charities ( name, slug )")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const charities = data.charities as { name?: string; slug?: string } | null;
  if (!charities?.name || !charities?.slug) {
    return null;
  }

  return {
    charityId: String(data.charity_id),
    name: String(charities.name),
    slug: String(charities.slug),
    percentage: Number(data.percentage),
  };
}

export async function getDashboardScores(
  supabase: SupabaseClient,
  userId: string,
): Promise<ScoreRow[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("id, user_id, score, played_on, created_at")
    .eq("user_id", userId)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ScoreRow[];
}

export async function getDashboardParticipation(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardParticipation> {
  const { count, error: countError } = await supabase
    .from("draw_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw new Error(countError.message);
  }

  const monthStart = firstDayOfMonthIso(new Date());
  const { data: upcoming, error: drawError } = await supabase
    .from("draws")
    .select("month, status")
    .gte("month", monthStart)
    .order("month", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (drawError) {
    throw new Error(drawError.message);
  }

  return {
    drawsEntered: count ?? 0,
    upcomingDrawMonth: upcoming?.month
      ? formatDrawMonthLabel(String(upcoming.month))
      : null,
    upcomingDrawStatus: upcoming?.status ? String(upcoming.status) : null,
  };
}

export async function getDashboardWinnings(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardWinnings> {
  const { data, error } = await supabase
    .from("winners")
    .select("prize_amount, payment")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return { totalWon: 0, winCount: 0, paymentPill: "none" };
  }

  const totalWon = rows.reduce(
    (sum, row) => sum + Number(row.prize_amount ?? 0),
    0,
  );
  const hasPending = rows.some((row) => row.payment === "pending");
  const allPaid = rows.every((row) => row.payment === "paid");

  return {
    totalWon,
    winCount: rows.length,
    paymentPill: hasPending ? "pending" : allPaid ? "paid" : "pending",
  };
}
