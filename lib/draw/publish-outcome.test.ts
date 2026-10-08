import { describe, expect, it, vi } from "vitest";

import * as algorithmic from "@/lib/draw/algorithmic";
import { calculatePrizePools } from "@/lib/draw/pools";
import { computePublishDrawOutcome } from "@/lib/draw/publish-outcome";
import * as random from "@/lib/draw/random";
import * as simulate from "@/lib/draw/simulate";

const PUBLISH_BASE = {
  subscriberScores: [10, 11, 12],
  activeSubscribers: 1,
  feePerSubscriber: 10,
  poolPercentage: 100,
  carryover: 0,
};

describe("computePublishDrawOutcome (publish flow)", () => {
  it("uses stored winning numbers and does not call simulateDraw", () => {
    const simulateDrawSpy = vi.spyOn(simulate, "simulateDraw");

    const storedWinningNumbers = [10, 11, 12, 30, 40];

    const expectedPools = calculatePrizePools(
      PUBLISH_BASE.activeSubscribers,
      PUBLISH_BASE.feePerSubscriber,
      PUBLISH_BASE.poolPercentage,
      PUBLISH_BASE.carryover,
    );

    const outcome = computePublishDrawOutcome({
      storedWinningNumbers,
      entries: [{ userId: "test-subscriber", scores: [10, 11, 12] }],
      ...PUBLISH_BASE,
    });

    expect(simulateDrawSpy).not.toHaveBeenCalled();
    simulateDrawSpy.mockRestore();

    expect(outcome.winningNumbers).toEqual(storedWinningNumbers);
    expect(outcome.matches).toEqual([
      { userId: "test-subscriber", matchCount: 3, tier: 3 },
    ]);
    expect(outcome.pools.totalPool).toBe(10);
    expect(outcome.pools.tier3Pool).toBe(2.5);
    expect(outcome.prizes.allocations).toHaveLength(1);
    expect(outcome.prizes.allocations[0]).toEqual({
      userId: "test-subscriber",
      tier: 3,
      prizeAmount: expectedPools.tier3Pool,
    });
    expect(outcome.prizes.nextJackpotCarryover).toBe(4);
  });

  it("does not generate new random or algorithmic winning numbers", () => {
    const randomSpy = vi.spyOn(random, "generateRandomDraw");
    const algorithmicSpy = vi.spyOn(algorithmic, "generateAlgorithmicDraw");

    computePublishDrawOutcome({
      storedWinningNumbers: [22, 23, 24, 25, 26],
      entries: [{ userId: "u1", scores: [22, 23, 24, 1, 2] }],
      ...PUBLISH_BASE,
    });

    expect(randomSpy).not.toHaveBeenCalled();
    expect(algorithmicSpy).not.toHaveBeenCalled();

    randomSpy.mockRestore();
    algorithmicSpy.mockRestore();
  });

  it("recomputes winners via previewDrawResult using the stored numbers only", () => {
    const previewSpy = vi.spyOn(simulate, "previewDrawResult");
    const storedWinningNumbers = [10, 11, 12, 13, 14];
    const entries = [{ userId: "jackpot", scores: [10, 11, 12, 13, 14] }];

    const outcome = computePublishDrawOutcome({
      storedWinningNumbers,
      entries,
      ...PUBLISH_BASE,
    });

    expect(previewSpy).toHaveBeenCalledTimes(1);
    expect(previewSpy).toHaveBeenCalledWith(
      storedWinningNumbers,
      expect.objectContaining({ entries }),
    );

    expect(outcome.winningNumbers).toEqual(storedWinningNumbers);
    expect(outcome.prizes.allocations).toEqual([
      { userId: "jackpot", tier: 5, prizeAmount: 4 },
    ]);
    expect(outcome.prizes.nextJackpotCarryover).toBe(0);

    previewSpy.mockRestore();
  });

  it("throws when stored winning numbers are not five balls", () => {
    expect(() =>
      computePublishDrawOutcome({
        storedWinningNumbers: [1, 2, 3],
        entries: [],
        ...PUBLISH_BASE,
      }),
    ).toThrow("Draw is missing simulated winning numbers.");
  });
});
