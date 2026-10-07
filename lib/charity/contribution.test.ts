import { describe, expect, it } from "vitest";

import {
  calculateCharityContribution,
  MIN_CHARITY_PERCENTAGE,
  normalizeCharityPercentage,
} from "@/lib/charity/contribution";

describe("normalizeCharityPercentage", () => {
  it("enforces minimum 10%", () => {
    expect(normalizeCharityPercentage(5)).toBe(MIN_CHARITY_PERCENTAGE);
    expect(normalizeCharityPercentage(10)).toBe(10);
    expect(normalizeCharityPercentage(42)).toBe(42);
    expect(normalizeCharityPercentage(150)).toBe(100);
  });
});

describe("calculateCharityContribution", () => {
  it("calculates amount from fee and percentage", () => {
    const result = calculateCharityContribution(1000, 25);
    expect(result.percentage).toBe(25);
    expect(result.amountCents).toBe(250);
  });

  it("clamps low percentages to 10%", () => {
    const result = calculateCharityContribution(2000, 5);
    expect(result.percentage).toBe(10);
    expect(result.amountCents).toBe(200);
  });

  it("rounds to nearest cent", () => {
    const result = calculateCharityContribution(999, 33);
    expect(result.amountCents).toBe(330);
  });
});
