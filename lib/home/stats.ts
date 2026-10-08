import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CURRENCY_SYMBOL } from "@/lib/money";
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

      const { data: donations } = await admin
        .from("donations")
        .select("amount_cents")
        .eq("status", "succeeded")
        .eq("currency", "inr");

      const donationTotal =
        (donations ?? []).reduce(
          (sum, row) => sum + Number(row.amount_cents ?? 0),
          0,
        ) / 100;

      const monthlyFee = getMonthlySubscriptionFeeInr();
      const { data: userCharity } = await admin
        .from("user_charity")
        .select("percentage");

      const committedMonthly = (userCharity ?? []).reduce(
        (sum, row) => sum + monthlyFee * (Number(row.percentage ?? 10) / 100),
        0,
      );

      totalRaised = Math.round(donationTotal + committedMonthly * 6);

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
