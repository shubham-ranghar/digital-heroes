import { countUnreadContactMessages } from "@/lib/contact/admin-queries";
import { getDrawFeeConfig, loadActiveSubscriberIds } from "@/lib/draw/db";
import { calculatePrizePools } from "@/lib/draw/pools";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminOverviewStats = {
  totalUsers: number;
  activeSubscribers: number;
  currentPrizePool: number;
  nextDrawStatus: string;
  /** Current draw's month (YYYY-MM-01), when one exists. */
  currentDrawMonth: string | null;
  currentDrawEntries: number;
  pendingWinnerVerifications: number;
  unreadContactMessages: number;
};

export type AdminActivityEvent = {
  id: string;
  kind: "signup" | "score" | "draw_published" | "proof_submitted";
  label: string;
  /** ISO timestamp. */
  at: string;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const admin = createAdminClient();
  const feeConfig = getDrawFeeConfig();

  const { count: totalUsers } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Latest row per user, the same count the draw engine uses for pools.
  const activeSubscribers = (await loadActiveSubscriberIds(admin)).size;

  const monthIso = new Date();
  const monthKey = `${monthIso.getUTCFullYear()}-${String(monthIso.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const { data: currentDraw } = await admin
    .from("draws")
    .select("id, month, status, jackpot_carryover")
    .gte("month", monthKey)
    .order("month", { ascending: true })
    .limit(1)
    .maybeSingle();

  let currentDrawEntries = 0;
  if (currentDraw?.id) {
    const { count } = await admin
      .from("draw_entries")
      .select("id", { count: "exact", head: true })
      .eq("draw_id", currentDraw.id);
    currentDrawEntries = count ?? 0;
  }

  const carryover = Number(currentDraw?.jackpot_carryover ?? 0);
  const pools = calculatePrizePools(
    activeSubscribers,
    feeConfig.feePerSubscriber,
    feeConfig.poolPercentage,
    carryover,
  );

  const { count: pendingWinnerVerifications } = await admin
    .from("winners")
    .select("id", { count: "exact", head: true })
    .eq("verification", "pending");

  const unreadContactMessages = await countUnreadContactMessages();

  return {
    totalUsers: totalUsers ?? 0,
    activeSubscribers,
    currentPrizePool: pools.totalPool,
    nextDrawStatus: currentDraw?.status ?? "not scheduled",
    currentDrawMonth: currentDraw?.month ? String(currentDraw.month) : null,
    currentDrawEntries,
    pendingWinnerVerifications: pendingWinnerVerifications ?? 0,
    unreadContactMessages,
  };
}

/**
 * The last ten platform events, merged from the four tables that record
 * member-visible activity. Timestamps are each row's own created/updated
 * time; a draw's "published" time is its last update while published.
 */
export async function getAdminRecentActivity(
  limit = 10,
): Promise<AdminActivityEvent[]> {
  const admin = createAdminClient();

  const [profiles, scores, draws, proofs] = await Promise.all([
    admin
      .from("profiles")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("scores")
      .select("id, score, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("draws")
      .select("id, month, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(limit),
    admin
      .from("winners")
      .select("id, tier, updated_at")
      .not("proof_url", "is", null)
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);

  const events: AdminActivityEvent[] = [
    ...(profiles.data ?? []).map((row) => ({
      id: `signup-${row.id}`,
      kind: "signup" as const,
      label: `${row.display_name?.trim() || "A new member"} signed up`,
      at: String(row.created_at),
    })),
    ...(scores.data ?? []).map((row) => ({
      id: `score-${row.id}`,
      kind: "score" as const,
      label: `Score logged — ${row.score} pts`,
      at: String(row.created_at),
    })),
    ...(draws.data ?? []).map((row) => ({
      id: `draw-${row.id}`,
      kind: "draw_published" as const,
      label: `Draw published — ${String(row.month).slice(0, 7)}`,
      at: String(row.updated_at),
    })),
    ...(proofs.data ?? []).map((row) => ({
      id: `proof-${row.id}`,
      kind: "proof_submitted" as const,
      label: `Prize proof submitted — tier ${row.tier}`,
      at: String(row.updated_at),
    })),
  ];

  return events
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}
