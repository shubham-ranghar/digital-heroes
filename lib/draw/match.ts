import type { PrizeTier } from "@/lib/draw/constants";
import type { DrawEntryInput, MatchResult } from "@/lib/draw/types";

/**
 * Greedy one-to-one matching between entry scores and winning numbers.
 */
export function countMatches(
  entryScores: number[],
  winningNumbers: number[],
): number {
  const remaining = [...winningNumbers];
  let matches = 0;

  for (const score of entryScores) {
    const index = remaining.indexOf(score);
    if (index !== -1) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }

  return matches;
}

function tierFromMatchCount(matchCount: number): PrizeTier | null {
  if (matchCount === 5 || matchCount === 4 || matchCount === 3) {
    return matchCount as PrizeTier;
  }
  return null;
}

/** Returns per-user match counts and prize tier (3, 4, 5) when eligible. */
export function matchEntries(
  entries: DrawEntryInput[],
  winningNumbers: number[],
): MatchResult[] {
  return entries.map((entry) => {
    const matchCount = countMatches(entry.scores, winningNumbers);
    return {
      userId: entry.userId,
      matchCount,
      tier: tierFromMatchCount(matchCount),
    };
  });
}
