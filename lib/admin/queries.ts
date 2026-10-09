import {
  ADMIN_PAGE_SIZE,
  pageOffset,
  parsePageJson,
  type AdminTableState,
  type PageResult,
} from "@/lib/admin/pagination";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDrawFeeConfig,
  loadActiveSubscriberIds,
  loadActiveSubscriberScores,
  loadDrawEntries,
} from "@/lib/draw/db";
import { withMemberLabels } from "@/lib/admin/member-labels";
import type { DrawSimulationPreview } from "@/lib/draw/admin-actions";
import { previewDrawResult } from "@/lib/draw/simulate";
import { loadPlatformTotals } from "@/lib/platform-totals";
import { getMonthlySubscriptionFeeInr } from "@/lib/subscription/fees";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import { getSubscriptionAccessLabel } from "@/lib/subscription/access";

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

export type AdminCharityBreakdownRow = {
  charityId: string;
  name: string;
  slug: string;
  activeSupporters: number;
  commitmentPerMonthInr: number;
  donationTotalInr: number;
};

export type AdminReports = {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePaid: number;
  totalPrizePending: number;
  estimatedPrizePool: number;
  /** Rate, not a total: active subscribers' charity share of one month's fee. */
  charityCommitmentPerMonthInr: number;
  /** Cumulative succeeded INR one-off donations. Never add to the monthly rate. */
  donationTotalInr: number;
  charityBreakdown: AdminCharityBreakdownRow[];
  drawsByStatus: { status: string; count: number }[];
  entriesPerDraw: { month: string; count: number }[];
};

function admin() {
  return createAdminClient();
}

/** URL params the admin Users table accepts (see `admin_list_users`). */
export const ADMIN_USERS_TABLE = {
  filters: { role: ["subscriber", "admin"], access: ["active", "inactive"] },
  sorts: ["email", "name", "role", "access", "plan", "scores", "joined"],
} as const;

/** Count from a PostgREST embedded `relation(count)` select. */
function embeddedCount(value: unknown): number {
  return Array.isArray(value) ? Number(value[0]?.count ?? 0) : 0;
}

function mapAdminUserRow(row: Record<string, unknown>): AdminUserRow {
  const status = (row.status as SubscriptionStatus | null) ?? null;
  const renewalDate = row.renewal_date ? String(row.renewal_date) : null;
  const cancelAtPeriodEnd = Boolean(row.cancel_at_period_end);
  // Access comes from has_active_subscription(), the same rule RLS enforces,
  // so the label always agrees with the Access filter.
  const hasAccess = Boolean(row.has_access);

  return {
    id: String(row.id),
    email: row.email == null ? null : String(row.email),
    displayName: row.display_name == null ? null : String(row.display_name),
    role: row.role as "subscriber" | "admin",
    plan: (row.plan as SubscriptionPlan | null) ?? null,
    subscriptionStatus: status,
    renewalDate,
    cancelAtPeriodEnd,
    hasAccess,
    accessLabel: getSubscriptionAccessLabel(
      status
        ? {
            status,
            renewal_date: renewalDate,
            cancel_at_period_end: cancelAtPeriodEnd,
          }
        : null,
      hasAccess,
    ).label,
    scoreCount: Number(row.score_count ?? 0),
  };
}

/** One page of the admin Users table; search, filters and sort run in SQL. */
export async function listAdminUsersPage(
  state: AdminTableState,
): Promise<PageResult<AdminUserRow>> {
  const { data, error } = await admin().rpc("admin_list_users", {
    p_search: state.q || null,
    p_role: state.filters.role ?? null,
    p_access: state.filters.access ?? null,
    p_sort: state.sort ?? "joined",
    p_dir: state.sort ? state.dir : "desc",
    p_limit: ADMIN_PAGE_SIZE,
    p_offset: pageOffset(state.page),
  });

  if (error) {
    throw new Error(error.message);
  }

  const { total, rows } = parsePageJson(data);
  return { total, rows: rows.map(mapAdminUserRow) };
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
    .select(
      "id, month, status, mode, winning_numbers, jackpot_carryover, draw_entries(count)",
    )
    .order("month", { ascending: false });

  if (error) {
    throw new Error(error.message);
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
      entryCount: embeddedCount(draw.draw_entries),
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

  return withMemberLabels(
    client,
    toDrawPreview(
      previewDrawResult(winningNumbers, {
        entries,
        subscriberScores: scores,
        activeSubscribers: activeCount,
        feePerSubscriber,
        poolPercentage,
        carryover: Number(draw.jackpot_carryover ?? 0),
      }),
    ),
  );
}

export async function listAdminCharities(): Promise<AdminCharityRow[]> {
  const client = admin();
  const { data: charities, error } = await client
    .from("charities")
    .select(
      "id, name, slug, description, images, is_featured, category, user_charity(count)",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
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
    supporterCount: embeddedCount(row.user_charity),
  }));
}

/**
 * Per-charity monthly commitment (active subscribers only) and cumulative
 * donations, from `admin_charity_breakdown()`. Sorted by monthly commitment.
 */
async function loadCharityBreakdown(
  client: ReturnType<typeof admin>,
): Promise<AdminCharityBreakdownRow[]> {
  const { data, error } = await client.rpc("admin_charity_breakdown");
  if (error) {
    throw new Error(error.message);
  }

  const monthlyFeeInr = getMonthlySubscriptionFeeInr();
  return ((data ?? []) as Record<string, unknown>[])
    .map((row) => ({
      charityId: String(row.charity_id),
      name: String(row.name),
      slug: String(row.slug),
      activeSupporters: Number(row.active_supporters ?? 0),
      commitmentPerMonthInr:
        monthlyFeeInr * (Number(row.active_percentage_sum ?? 0) / 100),
      donationTotalInr: Number(row.donation_paise ?? 0) / 100,
    }))
    .sort(
      (a, b) =>
        b.commitmentPerMonthInr - a.commitmentPerMonthInr ||
        b.donationTotalInr - a.donationTotalInr ||
        a.name.localeCompare(b.name),
    );
}

export async function getAdminReports(): Promise<AdminReports> {
  const client = admin();

  const { count: totalUsers, error: userError } = await client
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (userError) {
    throw new Error(userError.message);
  }

  const activeCount = (await loadActiveSubscriberIds(client)).size;
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();
  const estimatedPrizePool =
    activeCount * feePerSubscriber * (poolPercentage / 100);

  const totals = await loadPlatformTotals(client);
  const totalPrizePaid = totals.prizePaid;
  const totalPrizePending = totals.prizePending;

  const charityBreakdown = await loadCharityBreakdown(client);
  const charityCommitmentPerMonthInr = charityBreakdown.reduce(
    (sum, row) => sum + row.commitmentPerMonthInr,
    0,
  );
  const donationTotalInr = charityBreakdown.reduce(
    (sum, row) => sum + row.donationTotalInr,
    0,
  );

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

  return {
    totalUsers: totalUsers ?? 0,
    activeSubscribers: activeCount,
    totalPrizePaid,
    totalPrizePending,
    estimatedPrizePool,
    charityCommitmentPerMonthInr,
    donationTotalInr,
    charityBreakdown,
    drawsByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    entriesPerDraw,
  };
}
