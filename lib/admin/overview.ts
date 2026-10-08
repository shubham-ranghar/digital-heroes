import { countUnreadContactMessages } from "@/lib/contact/admin-queries";
import {
  activeSubscriberUserIdsFromRows,
  getDrawFeeConfig,
} from "@/lib/draw/db";
import { calculatePrizePools } from "@/lib/draw/pools";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminOverviewStats = {
  totalUsers: number;
  activeSubscribers: number;
  currentPrizePool: number;
  nextDrawStatus: string;
  pendingWinnerVerifications: number;
  unreadContactMessages: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const admin = createAdminClient();
  const feeConfig = getDrawFeeConfig();

  const { count: totalUsers } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("user_id, status, renewal_date, cancel_at_period_end, created_at");

  // Latest row per user, the same count the draw engine uses for pools.
  const activeSubscribers = activeSubscriberUserIdsFromRows(
    (subscriptions ?? []) as Parameters<typeof activeSubscriberUserIdsFromRows>[0],
  ).size;

  const monthIso = new Date();
  const monthKey = `${monthIso.getUTCFullYear()}-${String(monthIso.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const { data: currentDraw } = await admin
    .from("draws")
    .select("status, jackpot_carryover")
    .gte("month", monthKey)
    .order("month", { ascending: true })
    .limit(1)
    .maybeSingle();

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
    pendingWinnerVerifications: pendingWinnerVerifications ?? 0,
    unreadContactMessages,
  };
}
