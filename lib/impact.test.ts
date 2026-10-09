import { describe, expect, it } from "vitest";

import { getMemberImpact, schoolMealsFor } from "@/lib/impact";

describe("schoolMealsFor", () => {
  it("counts whole meals only", () => {
    expect(schoolMealsFor(12.12)).toBe(0);
    expect(schoolMealsFor(12.13)).toBe(1);
    expect(schoolMealsFor(49.9)).toBe(4);
  });

  it("treats empty or invalid amounts as zero", () => {
    expect(schoolMealsFor(0)).toBe(0);
    expect(schoolMealsFor(-5)).toBe(0);
    expect(schoolMealsFor(Number.NaN)).toBe(0);
  });
});

describe("getMemberImpact", () => {
  it("translates the minimum 10% of ₹499 into meals", () => {
    const impact = getMemberImpact(499, 10);
    expect(impact.monthlyShareInr).toBeCloseTo(49.9);
    expect(impact.yearlyShareInr).toBeCloseTo(598.8);
    expect(impact.mealsPerMonth).toBe(4);
    expect(impact.mealsPerYear).toBe(49);
    expect(impact.mealsPerHundredMembersMonthly).toBe(411);
  });
});
