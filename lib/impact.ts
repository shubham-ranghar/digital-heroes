import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";
import { getMonthlySubscriptionFeeInr } from "@/lib/subscription/fees";

/**
 * Average full cost of one primary-school meal under India's PM POSHAN
 * (mid-day meal) scheme for 2025–26: ₹6.78 central material cost plus
 * centrally supplied grain and transport, ≈ ₹12.13 per meal (Ministry of
 * Education revision effective 1 May 2025). Used only to translate rupees
 * into something people can picture; partner charities spend on their own
 * programmes, so copy must say "the cost of", never "funds N meals".
 */
export const SCHOOL_MEAL_COST_INR = 12.13;

export const SCHOOL_MEAL_SOURCE =
  "PM POSHAN average full cost of a primary-school meal, 2025–26 (₹12.13)";

/** Whole meals a rupee amount covers (never rounds up). */
export function schoolMealsFor(inr: number): number {
  if (!Number.isFinite(inr) || inr <= 0) {
    return 0;
  }
  return Math.floor(inr / SCHOOL_MEAL_COST_INR);
}

export type MemberImpact = {
  /** Minimum charity share of one monthly fee, in rupees. */
  monthlyShareInr: number;
  /** Same share across twelve monthly payments. */
  yearlyShareInr: number;
  mealsPerMonth: number;
  mealsPerYear: number;
  /** Monthly meals covered by the minimum share of a hundred members. */
  mealsPerHundredMembersMonthly: number;
};

/** Outcomes of one membership at the minimum charity share. */
export function getMemberImpact(
  monthlyFeeInr = getMonthlySubscriptionFeeInr(),
  sharePercent = MIN_CHARITY_PERCENTAGE,
): MemberImpact {
  const monthlyShareInr = (monthlyFeeInr * sharePercent) / 100;
  const yearlyShareInr = monthlyShareInr * 12;
  return {
    monthlyShareInr,
    yearlyShareInr,
    mealsPerMonth: schoolMealsFor(monthlyShareInr),
    mealsPerYear: schoolMealsFor(yearlyShareInr),
    mealsPerHundredMembersMonthly: schoolMealsFor(monthlyShareInr * 100),
  };
}
