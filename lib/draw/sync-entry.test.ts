import { describe, expect, it } from "vitest";

import { currentDrawMonthIso } from "@/lib/draw/sync-entry";

describe("currentDrawMonthIso", () => {
  it("returns YYYY-MM-01 for UTC month", () => {
    expect(currentDrawMonthIso(new Date("2026-03-15T12:00:00.000Z"))).toBe(
      "2026-03-01",
    );
  });
});
