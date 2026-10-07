/** Stableford points range used in draws. */
export const STABLEFORD_MIN = 1;
export const STABLEFORD_MAX = 45;

export const WINNING_NUMBER_COUNT = 5;

export const TIER_PERCENTAGES = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
} as const;

export type PrizeTier = keyof typeof TIER_PERCENTAGES;
