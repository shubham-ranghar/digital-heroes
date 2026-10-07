import { describe, expect, it } from "vitest";

import { generateAlgorithmicDraw } from "@/lib/draw/algorithmic";
import { generateRandomDraw } from "@/lib/draw/random";
import { createSeededRng } from "@/lib/draw/rng";
import { STABLEFORD_MAX, STABLEFORD_MIN, WINNING_NUMBER_COUNT } from "@/lib/draw/constants";

describe("generateRandomDraw", () => {
  it("returns five numbers in Stableford range", () => {
    const rng = createSeededRng(42);
    const draw = generateRandomDraw(rng);
    expect(draw).toHaveLength(WINNING_NUMBER_COUNT);
    for (const value of draw) {
      expect(value).toBeGreaterThanOrEqual(STABLEFORD_MIN);
      expect(value).toBeLessThanOrEqual(STABLEFORD_MAX);
    }
  });

  it("is deterministic with a seeded rng", () => {
    const a = generateRandomDraw(createSeededRng(99));
    const b = generateRandomDraw(createSeededRng(99));
    expect(a).toEqual(b);
  });
});

describe("generateAlgorithmicDraw", () => {
  it("favours frequent scores", () => {
    const scores = Array.from({ length: 50 }, () => 38);
    const rng = createSeededRng(1);
    const draws = Array.from({ length: 20 }, () =>
      generateAlgorithmicDraw(scores, rng),
    );
    const hits38 = draws.flat().filter((n) => n === 38).length;
    expect(hits38).toBeGreaterThan(20);
  });

  it("falls back to random when no scores provided", () => {
    const draw = generateAlgorithmicDraw([], createSeededRng(7));
    expect(draw).toHaveLength(WINNING_NUMBER_COUNT);
  });
});
