import { describe, expect, it } from "vitest";

import { calculatePrizePools } from "@/lib/draw/pools";
import { createSeededRng } from "@/lib/draw/rng";
import { previewDrawResult, simulateDraw } from "@/lib/draw/simulate";
import type { DrawEntryInput } from "@/lib/draw/types";

const TEN_POUND_POOL_BASE = {
  subscriberScores: [10, 11, 12],
  activeSubscribers: 1,
  feePerSubscriber: 10,
  poolPercentage: 100,
  carryover: 0,
};

function previewWithTenPoundPool(
  winningNumbers: number[],
  entries: DrawEntryInput[],
) {
  return previewDrawResult(winningNumbers, {
    ...TEN_POUND_POOL_BASE,
    entries,
  });
}

describe("simulateDraw integration", () => {
  it("produces a full simulation payload", () => {
    const result = simulateDraw({
      mode: "random",
      entries: [{ userId: "u1", scores: [38, 37, 36, 35, 34] }],
      subscriberScores: [38, 37, 36],
      activeSubscribers: 5,
      feePerSubscriber: 10,
      poolPercentage: 100,
      carryover: 0,
      rng: createSeededRng(123),
    });

    expect(result.winningNumbers).toHaveLength(5);
    expect(result.matches).toHaveLength(1);
    expect(result.pools.totalPool).toBe(50);
    expect(result.prizes.allocations.length).toBeLessThanOrEqual(1);
  });
});

describe("previewDrawResult", () => {
  it("awards tier 3 for snapshot [10,11,12] against winning [10,11,12,30,40]", () => {
    const winningNumbers = [10, 11, 12, 30, 40];

    const expectedPools = calculatePrizePools(
      TEN_POUND_POOL_BASE.activeSubscribers,
      TEN_POUND_POOL_BASE.feePerSubscriber,
      TEN_POUND_POOL_BASE.poolPercentage,
      TEN_POUND_POOL_BASE.carryover,
    );

    expect(expectedPools.totalPool).toBe(10);
    expect(expectedPools.tier3Pool).toBe(2.5);
    expect(expectedPools.tier5Pool).toBe(4);

    const result = previewWithTenPoundPool(winningNumbers, [
      { userId: "test-subscriber", scores: [10, 11, 12] },
    ]);

    expect(result.winningNumbers).toEqual(winningNumbers);
    expect(result.matches).toEqual([
      { userId: "test-subscriber", matchCount: 3, tier: 3 },
    ]);
    expect(result.pools.tier3Pool).toBe(expectedPools.tier3Pool);
    expect(result.prizes.allocations).toHaveLength(1);
    expect(result.prizes.allocations[0]).toEqual({
      userId: "test-subscriber",
      tier: 3,
      prizeAmount: 2.5,
    });
    expect(result.prizes.nextJackpotCarryover).toBe(4);
  });

  it("allocates no prizes when the entry has fewer than 3 matches", () => {
    const winningNumbers = [10, 11, 12, 30, 40];

    const result = previewWithTenPoundPool(winningNumbers, [
      { userId: "no-tier", scores: [10, 11, 99] },
    ]);

    expect(result.matches).toEqual([
      { userId: "no-tier", matchCount: 2, tier: null },
    ]);
    expect(result.prizes.allocations).toHaveLength(0);
    expect(result.prizes.nextJackpotCarryover).toBe(4);
  });

  it("awards tier 4 and ₹3.50 from a ₹10 pool for four matches", () => {
    const winningNumbers = [10, 11, 12, 13, 40];

    const result = previewWithTenPoundPool(winningNumbers, [
      { userId: "tier-four", scores: [10, 11, 12, 13, 1] },
    ]);

    expect(result.matches).toEqual([
      { userId: "tier-four", matchCount: 4, tier: 4 },
    ]);
    expect(result.pools.tier4Pool).toBe(3.5);
    expect(result.prizes.allocations).toEqual([
      { userId: "tier-four", tier: 4, prizeAmount: 3.5 },
    ]);
    expect(result.prizes.nextJackpotCarryover).toBe(4);
  });

  it("awards tier 5 and ₹4.00 with no jackpot carryover when five matches exist", () => {
    const winningNumbers = [10, 11, 12, 13, 14];

    const result = previewWithTenPoundPool(winningNumbers, [
      { userId: "jackpot", scores: [10, 11, 12, 13, 14] },
    ]);

    expect(result.matches).toEqual([
      { userId: "jackpot", matchCount: 5, tier: 5 },
    ]);
    expect(result.pools.tier5Pool).toBe(4);
    expect(result.prizes.allocations).toEqual([
      { userId: "jackpot", tier: 5, prizeAmount: 4 },
    ]);
    expect(result.prizes.nextJackpotCarryover).toBe(0);
  });

  it("preserves one-to-one matching when winning numbers contain duplicates", () => {
    const winningNumbers = [10, 10, 12, 13, 14];

    const result = previewWithTenPoundPool(winningNumbers, [
      { userId: "dupes", scores: [10, 10, 10, 99, 98] },
    ]);

    expect(result.matches).toEqual([
      { userId: "dupes", matchCount: 2, tier: null },
    ]);
    expect(result.prizes.allocations).toHaveLength(0);
  });
});
