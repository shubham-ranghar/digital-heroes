import type { PrizeTier } from "@/lib/draw/constants";

export type DrawEntryInput = {
  userId: string;
  /** Up to five Stableford scores for the draw period. */
  scores: number[];
};

export type MatchResult = {
  userId: string;
  matchCount: number;
  tier: PrizeTier | null;
};

export type PrizePoolBreakdown = {
  totalPool: number;
  tier5Pool: number;
  tier4Pool: number;
  tier3Pool: number;
};

export type WinnerAllocation = {
  userId: string;
  tier: PrizeTier;
  prizeAmount: number;
};

export type SplitPrizesResult = {
  allocations: WinnerAllocation[];
  /** Unclaimed 5-match tier funds rolled to the next draw. */
  nextJackpotCarryover: number;
};

export type DrawSimulationResult = {
  winningNumbers: number[];
  matches: MatchResult[];
  pools: PrizePoolBreakdown;
  prizes: SplitPrizesResult;
};
