/**
 * Single source of truth for charity categories (admin form + validation).
 * Must match the live `charities.category` values and supabase/seed.sql.
 */
export const CHARITY_CATEGORIES = [
  "Education",
  "Health",
  "Hunger & Food",
  "Youth & Sports",
] as const;

export type CharityCategory = (typeof CHARITY_CATEGORIES)[number];

export function isCharityCategory(value: string): value is CharityCategory {
  return (CHARITY_CATEGORIES as readonly string[]).includes(value);
}
