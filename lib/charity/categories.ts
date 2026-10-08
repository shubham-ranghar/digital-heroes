export const CHARITY_CATEGORIES = [
  "Youth & sports",
  "Food & shelter",
  "Health & wellbeing",
  "Education",
  "Environment",
  "Community",
] as const;

export type CharityCategory = (typeof CHARITY_CATEGORIES)[number];

export function isCharityCategory(value: string): value is CharityCategory {
  return (CHARITY_CATEGORIES as readonly string[]).includes(value);
}
