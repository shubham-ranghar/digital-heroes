import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDrawFeeConfig,
  loadActiveSubscriberScores,
  loadDrawEntries,
} from "@/lib/draw/db";
import type { DrawSimulationPreview } from "@/lib/draw/admin-actions";
import { previewDrawResult } from "@/lib/draw/simulate";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import {
  getSubscriptionAccessLabel,
  subscriptionGrantsAccess,
} from "@/lib/subscription/access";

export type AdminUserRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: "subscriber" | "admin";
  plan: SubscriptionPlan | null;
  subscriptionStatus: SubscriptionStatus | null;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  hasAccess: boolean;
  accessLabel: string;
  scoreCount: number;
};

export type AdminDrawRow = {
  id: string;
  month: string;
  status: string;
  mode: string;
  winningNumbers: number[] | null;
  jackpotCarryover: number;
  entryCount: number;
};

export type AdminCharityRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  category: string | null;
  isFeatured: boolean;
  supporterCount: number;
};

export type AdminReports = {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePaid: number;
  totalPrizePending: number;
  estimatedPrizePool: number;
  charityCommittedInr: number;
  donationTotalInr: number;
  totalCharityContribution: number;
  drawsByStatus: { status: string; count: number }[];
  entriesPerDraw: { month: string; count: number }[];
};

function admin() {
  return createAdminClient();
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const client = admin();

  const { data: profiles, error: profileError } = await client
    .from("profiles")
    .select("id, role, display_name")
    .order("created_at", { ascending: false });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: subscriptions, error: subError } = await client
    .from("subscriptions")
    .select("user_id, plan, status, renewal_date, cancel_at_period_end, created_at")
    .order("created_at", { ascending: false });

  if (subError) {
    throw new Error(subError.message);
  }

  const latestSubByUser = new Map<
    string,
    {
      plan: SubscriptionPlan;
      status: SubscriptionStatus;
      renewal_date: string | null;
      cancel_at_period_end: boolean;
    }
  >();
  for (const row of subscriptions ?? []) {
    const userId = row.user_id as string;
    if (!latestSubByUser.has(userId)) {
      latestSubByUser.set(userId, {
        plan: row.plan as SubscriptionPlan,
        status: row.status as SubscriptionStatus,
        renewal_date: row.renewal_date as string | null,
        cancel_at_period_end: Boolean(row.cancel_at_period_end),
      });
    }
  }

  const { data: scoreCounts, error: scoreError } = await client
    .from("scores")
    .select("user_id");

  if (scoreError) {
    throw new Error(scoreError.message);
  }

  const scoresByUser = new Map<string, number>();
  for (const row of scoreCounts ?? []) {
    const id = row.user_id as string;
    scoresByUser.set(id, (scoresByUser.get(id) ?? 0) + 1);
  }

  const emailById = new Map<string, string>();
  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data: authPage, error: authError } = await client.auth.admin.listUsers({
      page,
      perPage,
    });
    if (authError) {
      break;
    }
    for (const user of authPage.users) {
      emailById.set(user.id, user.email ?? "");
    }
    if (authPage.users.length < perPage) {
      break;
    }
    page += 1;
  }

  return (profiles ?? []).map((profile) => {
    const sub = latestSubByUser.get(profile.id);
    const hasAccess = sub
      ? subscriptionGrantsAccess({
          status: sub.status,
          renewal_date: sub.renewal_date,
          cancel_at_period_end: sub.cancel_at_period_end,
        })
      : false;

    const accessLabel = getSubscriptionAccessLabel(
      sub
        ? {
            status: sub.status,
            renewal_date: sub.renewal_date,
            cancel_at_period_end: sub.cancel_at_period_end,
          }
        : null,
      hasAccess,
    ).label;

    return {
      id: profile.id,
      email: emailById.get(profile.id) ?? null,
      displayName: profile.display_name,
      role: profile.role as "subscriber" | "admin",
      plan: sub?.plan ?? null,
      subscriptionStatus: sub?.status ?? null,
      renewalDate: sub?.renewal_date ?? null,
      cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
      hasAccess,
      accessLabel,
      scoreCount: scoresByUser.get(profile.id) ?? 0,
    };
  });
}

export async function listAdminUserScores(userId: string) {
  const client = admin();
  const { data, error } = await client
    .from("scores")
    .select("id, user_id, score, played_on, created_at")
    .eq("user_id", userId)
    .order("played_on", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listAdminDraws(): Promise<AdminDrawRow[]> {
  const client = admin();
  const { data: draws, error } = await client
    .from("draws")
    .select("id, month, status, mode, winning_numbers, jackpot_carryover")
    .order("month", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: entryRows, error: entryError } = await client
    .from("draw_entries")
    .select("draw_id");

  if (entryError) {
    throw new Error(entryError.message);
  }

  const entryCount = new Map<string, number>();
  for (const row of entryRows ?? []) {
    const id = row.draw_id as string;
    entryCount.set(id, (entryCount.get(id) ?? 0) + 1);
  }

  return (draws ?? []).map((draw) => {
    const numbers = Array.isArray(draw.winning_numbers)
      ? (draw.winning_numbers as number[])
      : null;
    return {
      id: draw.id as string,
      month: String(draw.month),
      status: String(draw.status),
      mode: String(draw.mode),
      winningNumbers: numbers,
      jackpotCarryover: Number(draw.jackpot_carryover ?? 0),
      entryCount: entryCount.get(draw.id as string) ?? 0,
    };
  });
}

function toDrawPreview(
  simulation: ReturnType<typeof previewDrawResult>,
): DrawSimulationPreview {
  const winnerRows = simulation.prizes.allocations.map((allocation) => {
    const match = simulation.matches.find(
      (row) => row.userId === allocation.userId && row.tier === allocation.tier,
    );
    return {
      userId: allocation.userId,
      tier: allocation.tier,
      prizeAmount: allocation.prizeAmount,
      matchCount: match?.matchCount ?? allocation.tier,
    };
  });

  return {
    winningNumbers: simulation.winningNumbers,
    totalPool: simulation.pools.totalPool,
    tier5Pool: simulation.pools.tier5Pool,
    tier4Pool: simulation.pools.tier4Pool,
    tier3Pool: simulation.pools.tier3Pool,
    nextJackpotCarryover: simulation.prizes.nextJackpotCarryover,
    winners: winnerRows,
  };
}

export async function getDrawSimulationPreview(
  drawId: string,
): Promise<DrawSimulationPreview | null> {
  const client = admin();
  const { data: draw, error } = await client
    .from("draws")
    .select("id, winning_numbers, jackpot_carryover, status")
    .eq("id", drawId)
    .maybeSingle();

  if (error || !draw) {
    return null;
  }

  const winningNumbers = Array.isArray(draw.winning_numbers)
    ? (draw.winning_numbers as number[])
    : null;

  if (!winningNumbers || winningNumbers.length !== 5) {
    return null;
  }

  const entries = await loadDrawEntries(client, drawId);
  const { activeCount, scores } = await loadActiveSubscriberScores(client);
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();

  return toDrawPreview(
    previewDrawResult(winningNumbers, {
      entries,
      subscriberScores: scores,
      activeSubscribers: activeCount,
      feePerSubscriber,
      poolPercentage,
      carryover: Number(draw.jackpot_carryover ?? 0),
    }),
  );
}

export async function listAdminCharities(): Promise<AdminCharityRow[]> {
  const client = admin();
  const { data: charities, error } = await client
    .from("charities")
    .select("id, name, slug, description, images, is_featured, category")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data: supporters, error: supError } = await client
    .from("user_charity")
    .select("charity_id");

  if (supError) {
    throw new Error(supError.message);
  }

  const countByCharity = new Map<string, number>();
  for (const row of supporters ?? []) {
    const id = row.charity_id as string;
    countByCharity.set(id, (countByCharity.get(id) ?? 0) + 1);
  }

  return (charities ?? []).map((row) => ({
    id: row.id as string,
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    images: Array.isArray(row.images)
      ? (row.images as string[]).map(String)
      : [],
    category: row.category ? String(row.category) : null,
    isFeatured: Boolean(row.is_featured),
    supporterCount: countByCharity.get(row.id as string) ?? 0,
  }));
}

export async function getAdminReports(): Promise<AdminReports> {
  const client = admin();

  const { count: totalUsers, error: userError } = await client
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (userError) {
    throw new Error(userError.message);
  }

  const { activeCount } = await loadActiveSubscriberScores(client);
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();
  const estimatedPrizePool =
    activeCount * feePerSubscriber * (poolPercentage / 100);

  const { data: winners, error: winnerError } = await client
    .from("winners")
    .select("prize_amount, payment");

  if (winnerError) {
    throw new Error(winnerError.message);
  }

  let totalPrizePaid = 0;
  let totalPrizePending = 0;
  for (const row of winners ?? []) {
    const amount = Number(row.prize_amount ?? 0);
    if (row.payment === "paid") {
      totalPrizePaid += amount;
    } else {
      totalPrizePending += amount;
    }
  }

  const monthlyFeeInr = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR ?? "499");
  const { data: userCharityRows, error: ucError } = await client
    .from("user_charity")
    .select("percentage");

  if (ucError) {
    throw new Error(ucError.message);
  }

  let charityCommittedInr = 0;
  for (const row of userCharityRows ?? []) {
    charityCommittedInr +=
      monthlyFeeInr * (Number(row.percentage ?? 10) / 100);
  }

  const { data: donations, error: donError } = await client
    .from("donations")
    .select("amount_cents")
    .eq("status", "succeeded");

  if (donError) {
    throw new Error(donError.message);
  }

  const donationTotalInr =
    (donations ?? []).reduce(
      (sum, row) => sum + Number(row.amount_cents ?? 0),
      0,
    ) / 100;

  const { data: draws, error: drawError } = await client
    .from("draws")
    .select("status");

  if (drawError) {
    throw new Error(drawError.message);
  }

  const statusCounts = new Map<string, number>();
  for (const row of draws ?? []) {
    const status = String(row.status);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const { data: drawMonths, error: dmError } = await client
    .from("draws")
    .select("id, month")
    .order("month", { ascending: false })
    .limit(6);

  if (dmError) {
    throw new Error(dmError.message);
  }

  const entriesPerDraw: { month: string; count: number }[] = [];
  for (const draw of drawMonths ?? []) {
    const { count } = await client
      .from("draw_entries")
      .select("id", { count: "exact", head: true })
      .eq("draw_id", draw.id);

    entriesPerDraw.push({
      month: String(draw.month).slice(0, 7),
      count: count ?? 0,
    });
  }

  const totalCharityContribution = charityCommittedInr + donationTotalInr;

  return {
    totalUsers: totalUsers ?? 0,
    activeSubscribers: activeCount,
    totalPrizePaid,
    totalPrizePending,
    estimatedPrizePool,
    charityCommittedInr,
    donationTotalInr,
    totalCharityContribution,
    drawsByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    entriesPerDraw,
  };
}
