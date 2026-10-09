import { loadActiveSubscriberIds } from "@/lib/draw/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { CURRENCY_SYMBOL } from "@/lib/money";
import { loadPlatformTotals } from "@/lib/platform-totals";
import { getMonthlySubscriptionFeeInr } from "@/lib/subscription/fees";

export type HomeStats = {
  totalRaisedDisplay: number | null;
  currencySymbol: string;
  nextDrawDate: string;
  daysUntilDraw: number;
  jackpotRollover: number;
  charityShareLabel: string;
};

function firstDayOfNextMonth(from = new Date()): Date {
  return new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 12, 0, 0),
  );
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function getHomeStats(): Promise<HomeStats> {
  const now = new Date();
  let nextDraw = firstDayOfNextMonth(now);
  let jackpotRollover = 0;
  let totalRaised: number | null = null;

  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();

      const [totals, activeIds, charityRows] = await Promise.all([
        loadPlatformTotals(admin),
        loadActiveSubscriberIds(admin),
        fetchAllRows<{ user_id: string; percentage: number }>((from, to) =>
          admin
            .from("user_charity")
            .select("user_id, percentage")
            .order("user_id")
            .range(from, to),
        ),
      ]);

      // Only members whose subscription currently grants access are paying in;
      // lapsed and never-subscribed members' percentages are not money raised.
      const activePercentageSum = charityRows
        .filter((row) => activeIds.has(row.user_id))
        .reduce((sum, row) => sum + Number(row.percentage ?? 0), 0);
      const committedMonthly =
        getMonthlySubscriptionFeeInr() * (activePercentageSum / 100);

      totalRaised = Math.round(totals.donationTotalInr + committedMonthly);

      const monthIso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const { data: currentDraw } = await admin
        .from("draws")
        .select("month, jackpot_carryover, status")
        .gte("month", monthIso)
        .order("month", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (currentDraw?.month) {
        nextDraw = new Date(`${currentDraw.month}T12:00:00.000Z`);
        if (nextDraw <= now) {
          nextDraw = firstDayOfNextMonth(now);
        }
        jackpotRollover = Number(currentDraw.jackpot_carryover ?? 0);
      } else {
        const { data: latestPublished } = await admin
          .from("draws")
          .select("jackpot_carryover, month")
          .eq("status", "published")
          .order("month", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestPublished) {
          jackpotRollover = Number(latestPublished.jackpot_carryover ?? 0);
        }
      }
    } catch {
      totalRaised = null;
    }
  }

  const daysUntilDraw = daysBetween(now, nextDraw);

  return {
    totalRaisedDisplay: totalRaised,
    currencySymbol: CURRENCY_SYMBOL,
    nextDrawDate: nextDraw.toISOString(),
    daysUntilDraw,
    jackpotRollover,
    charityShareLabel: "10%+ to your cause",
  };
}
