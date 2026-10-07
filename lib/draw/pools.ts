import { TIER_PERCENTAGES, type PrizeTier } from "@/lib/draw/constants";
import type {
  MatchResult,
  PrizePoolBreakdown,
  SplitPrizesResult,
  WinnerAllocation,
} from "@/lib/draw/types";

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Compute tier pools from active subscribers and fee.
 * `poolPercentage` is the share of gross fees allocated to prizes (e.g. 100 = full fee pool).
 * `carryover` is added only to the 5-match tier (jackpot).
 */
export function calculatePrizePools(
  activeSubscribers: number,
  feePerSubscriber: number,
  poolPercentage: number,
  carryover: number,
): PrizePoolBreakdown {
  const safeSubscribers = Math.max(0, activeSubscribers);
  const safeFee = Math.max(0, feePerSubscriber);
  const safePercentage = Math.max(0, poolPercentage);

  const totalPool = roundMoney(
    safeSubscribers * safeFee * (safePercentage / 100),
  );

  const tier5Pool = roundMoney(
    totalPool * TIER_PERCENTAGES[5] + Math.max(0, carryover),
  );
  const tier4Pool = roundMoney(totalPool * TIER_PERCENTAGES[4]);
  const tier3Pool = roundMoney(totalPool * TIER_PERCENTAGES[3]);

  return {
    totalPool,
    tier5Pool,
    tier4Pool,
    tier3Pool,
  };
}

function splitPoolAmongWinners(
  poolAmount: number,
  winnerUserIds: string[],
  tier: PrizeTier,
): WinnerAllocation[] {
  if (winnerUserIds.length === 0 || poolAmount <= 0) {
    return [];
  }

  const poolCents = Math.round(poolAmount * 100);
  const baseShare = Math.floor(poolCents / winnerUserIds.length);
  let remainder = poolCents - baseShare * winnerUserIds.length;

  return winnerUserIds.map((userId) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) {
      remainder -= 1;
    }
    const cents = baseShare + extra;
    return {
      userId,
      tier,
      prizeAmount: cents / 100,
    };
  });
}

/**
 * Split each tier pool equally among winners in that tier.
 * Unclaimed 5-match pool rolls over to `nextJackpotCarryover`.
 */
export function splitPrizes(
  pools: PrizePoolBreakdown,
  matches: MatchResult[],
): SplitPrizesResult {
  const tier5Winners = matches
    .filter((match) => match.tier === 5)
    .map((match) => match.userId);
  const tier4Winners = matches
    .filter((match) => match.tier === 4)
    .map((match) => match.userId);
  const tier3Winners = matches
    .filter((match) => match.tier === 3)
    .map((match) => match.userId);

  const allocations: WinnerAllocation[] = [
    ...splitPoolAmongWinners(pools.tier5Pool, tier5Winners, 5),
    ...splitPoolAmongWinners(pools.tier4Pool, tier4Winners, 4),
    ...splitPoolAmongWinners(pools.tier3Pool, tier3Winners, 3),
  ];

  const nextJackpotCarryover =
    tier5Winners.length === 0 ? roundMoney(pools.tier5Pool) : 0;

  return {
    allocations,
    nextJackpotCarryover,
  };
}
