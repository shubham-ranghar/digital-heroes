/** Minimum share of subscription fee directed to charity (PRD). */
export const MIN_CHARITY_PERCENTAGE = 10;

export type CharityContribution = {
  /** Effective percentage after clamping to [10, 100]. */
  percentage: number;
  /** Whole paise allocated to charity (rounded). */
  amountCents: number;
};

/** Clamp user-selected percentage to the allowed range. */
export function normalizeCharityPercentage(percentage: number): number {
  if (!Number.isFinite(percentage)) {
    return MIN_CHARITY_PERCENTAGE;
  }
  return Math.min(100, Math.max(MIN_CHARITY_PERCENTAGE, percentage));
}

/**
 * Compute charity amount from subscription fee and member percentage.
 * Fee is in paise (INR minor units). Percentage minimum 10%.
 */
export function calculateCharityContribution(
  subscriptionFeeCents: number,
  percentage: number,
): CharityContribution {
  if (!Number.isFinite(subscriptionFeeCents) || subscriptionFeeCents < 0) {
    throw new Error("subscriptionFeeCents must be a non-negative number");
  }

  const effectivePercentage = normalizeCharityPercentage(percentage);
  const amountCents = Math.round(
    subscriptionFeeCents * (effectivePercentage / 100),
  );

  return {
    percentage: effectivePercentage,
    amountCents,
  };
}
