import { describe, expect, it } from "vitest";

import { calculatePrizePools, splitPrizes } from "@/lib/draw/pools";
import type { MatchResult } from "@/lib/draw/types";

describe("calculatePrizePools", () => {
  it("handles zero subscribers with carryover only on tier 5", () => {
    const pools = calculatePrizePools(0, 10, 100, 50);
    expect(pools.totalPool).toBe(0);
    expect(pools.tier5Pool).toBe(50);
    expect(pools.tier4Pool).toBe(0);
    expect(pools.tier3Pool).toBe(0);
  });

  it("splits 40/35/25 and adds carryover to tier 5", () => {
    const pools = calculatePrizePools(100, 10, 100, 25);
    expect(pools.totalPool).toBe(1000);
    expect(pools.tier5Pool).toBe(425);
    expect(pools.tier4Pool).toBe(350);
    expect(pools.tier3Pool).toBe(250);
  });
});

describe("splitPrizes", () => {
  const pools = calculatePrizePools(10, 10, 100, 0);

  it("returns no allocations when there are no winners", () => {
    const matches: MatchResult[] = [
      { userId: "u1", matchCount: 2, tier: null },
      { userId: "u2", matchCount: 1, tier: null },
    ];
    const result = splitPrizes(pools, matches);
    expect(result.allocations).toHaveLength(0);
    expect(result.nextJackpotCarryover).toBe(pools.tier5Pool);
  });

  it("rolls jackpot when no 5-match winners", () => {
    const matches: MatchResult[] = [
      { userId: "u1", matchCount: 4, tier: 4 },
    ];
    const result = splitPrizes(pools, matches);
    expect(result.nextJackpotCarryover).toBe(pools.tier5Pool);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0]?.prizeAmount).toBe(pools.tier4Pool);
  });

  it("splits equally among multiple winners in the same tier", () => {
    const matches: MatchResult[] = [
      { userId: "u1", matchCount: 3, tier: 3 },
      { userId: "u2", matchCount: 3, tier: 3 },
      { userId: "u3", matchCount: 3, tier: 3 },
    ];
    const result = splitPrizes(pools, matches);
    const tier3 = result.allocations.filter((a) => a.tier === 3);
    expect(tier3).toHaveLength(3);
    const total = tier3.reduce((sum, row) => sum + row.prizeAmount, 0);
    expect(total).toBeCloseTo(pools.tier3Pool, 2);
    const amounts = tier3.map((row) => row.prizeAmount);
    expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(
      0.01,
    );
  });

  it("awards tier 5 pool when jackpot winners exist", () => {
    const matches: MatchResult[] = [
      { userId: "jack", matchCount: 5, tier: 5 },
    ];
    const result = splitPrizes(pools, matches);
    expect(result.nextJackpotCarryover).toBe(0);
    expect(result.allocations[0]?.prizeAmount).toBe(pools.tier5Pool);
  });
});
