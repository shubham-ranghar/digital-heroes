import { describe, expect, it } from "vitest";

import { countMatches, matchEntries } from "@/lib/draw/match";

describe("countMatches", () => {
  it("counts one-to-one matches without reusing winning balls", () => {
    expect(countMatches([38, 34, 30], [38, 38, 12])).toBe(1);
    expect(countMatches([38, 34, 30], [38, 34, 12])).toBe(2);
  });
});

describe("matchEntries", () => {
  it("assigns tiers only for 3, 4, or 5 matches", () => {
    const results = matchEntries(
      [
        { userId: "a", scores: [10, 11, 12, 13, 14] },
        { userId: "b", scores: [10, 11, 12, 99, 98] },
        { userId: "c", scores: [10, 11, 99, 98, 97] },
      ],
      [10, 11, 12, 13, 14],
    );

    expect(results.find((r) => r.userId === "a")?.tier).toBe(5);
    expect(results.find((r) => r.userId === "b")?.tier).toBe(3);
    expect(results.find((r) => r.userId === "c")?.tier).toBeNull();
  });
});
