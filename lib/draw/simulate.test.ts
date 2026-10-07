import { describe, expect, it } from "vitest";

import { simulateDraw } from "@/lib/draw/simulate";
import { createSeededRng } from "@/lib/draw/rng";

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
