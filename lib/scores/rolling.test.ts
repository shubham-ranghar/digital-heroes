import { describe, expect, it } from "vitest";

import {
  applyScoreRetention,
  findScoreOnDate,
  keepLatestScores,
  sortScoresNewestFirst,
} from "@/lib/scores/rolling";

const rows = [
  { id: "1", played_on: "2026-10-01", score: 30, created_at: "2026-10-01T10:00:00Z" },
  { id: "2", played_on: "2026-10-05", score: 34, created_at: "2026-10-05T10:00:00Z" },
  { id: "3", played_on: "2026-10-07", score: 38, created_at: "2026-10-07T10:00:00Z" },
  { id: "4", played_on: "2026-10-03", score: 32, created_at: "2026-10-03T10:00:00Z" },
  { id: "5", played_on: "2026-09-28", score: 28, created_at: "2026-09-28T10:00:00Z" },
  { id: "6", played_on: "2026-09-20", score: 25, created_at: "2026-09-20T10:00:00Z" },
];

describe("sortScoresNewestFirst", () => {
  it("orders by played_on descending", () => {
    const sorted = sortScoresNewestFirst(rows);
    expect(sorted.map((r) => r.played_on)).toEqual([
      "2026-10-07",
      "2026-10-05",
      "2026-10-03",
      "2026-10-01",
      "2026-09-28",
      "2026-09-20",
    ]);
  });
});

describe("keepLatestScores", () => {
  it("keeps only five newest rounds", () => {
    const kept = keepLatestScores(rows);
    expect(kept).toHaveLength(5);
    expect(kept.map((r) => r.id)).toEqual(["3", "2", "4", "1", "5"]);
  });
});

describe("applyScoreRetention", () => {
  it("replaces an existing score on the same date", () => {
    const incoming = {
      id: "1",
      played_on: "2026-10-01",
      score: 36,
      created_at: "2026-10-01T12:00:00Z",
    };
    const result = applyScoreRetention(rows, incoming);
    const oct1 = findScoreOnDate(result, "2026-10-01");
    expect(oct1?.score).toBe(36);
    expect(result.filter((r) => r.played_on === "2026-10-01")).toHaveLength(1);
  });

  it("drops the oldest when a sixth distinct date is added", () => {
    const incoming = {
      id: "7",
      played_on: "2026-10-08",
      score: 40,
      created_at: "2026-10-08T10:00:00Z",
    };
    const base = keepLatestScores(rows);
    const result = applyScoreRetention(base, incoming);
    expect(result).toHaveLength(5);
    expect(result.some((r) => r.id === "5")).toBe(false);
    expect(findScoreOnDate(result, "2026-10-08")?.score).toBe(40);
  });
});

describe("findScoreOnDate", () => {
  it("returns a row for the given calendar date", () => {
    expect(findScoreOnDate(rows, "2026-10-05")?.score).toBe(34);
    expect(findScoreOnDate(rows, "2026-01-01")).toBeUndefined();
  });
});
