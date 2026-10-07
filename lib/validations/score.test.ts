import { describe, expect, it, vi } from "vitest";

import { scoreFormSchema, scoreValueSchema } from "@/lib/validations/score";

describe("scoreValueSchema", () => {
  it("accepts Stableford range 1–45", () => {
    expect(scoreValueSchema.parse(1)).toBe(1);
    expect(scoreValueSchema.parse(45)).toBe(45);
  });

  it("rejects values outside 1–45", () => {
    expect(scoreValueSchema.safeParse(0).success).toBe(false);
    expect(scoreValueSchema.safeParse(46).success).toBe(false);
    expect(scoreValueSchema.safeParse(12.5).success).toBe(false);
  });
});

describe("scoreFormSchema", () => {
  it("requires ISO date and blocks future dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T12:00:00.000Z"));

    const valid = scoreFormSchema.safeParse({
      score: 38,
      playedOn: "2026-10-07",
    });
    expect(valid.success).toBe(true);

    const future = scoreFormSchema.safeParse({
      score: 38,
      playedOn: "2026-10-08",
    });
    expect(future.success).toBe(false);

    vi.useRealTimers();
  });

  it("rejects malformed dates", () => {
    const result = scoreFormSchema.safeParse({
      score: 30,
      playedOn: "07/10/2026",
    });
    expect(result.success).toBe(false);
  });
});
