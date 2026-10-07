import {
  STABLEFORD_MAX,
  STABLEFORD_MIN,
  WINNING_NUMBER_COUNT,
} from "@/lib/draw/constants";
import { defaultRng, randomInt, type Rng } from "@/lib/draw/rng";
import { generateRandomDraw } from "@/lib/draw/random";

export type ScoreFrequencyMap = Record<number, number>;

function buildFrequencyMap(scores: number[]): ScoreFrequencyMap {
  const map: ScoreFrequencyMap = {};
  for (let value = STABLEFORD_MIN; value <= STABLEFORD_MAX; value += 1) {
    map[value] = 0;
  }
  for (const score of scores) {
    if (score >= STABLEFORD_MIN && score <= STABLEFORD_MAX) {
      map[score] = (map[score] ?? 0) + 1;
    }
  }
  return map;
}

function pickWeightedScore(frequencies: ScoreFrequencyMap, rng: Rng): number {
  const entries = Object.entries(frequencies).map(([value, weight]) => ({
    value: Number(value),
    weight: Math.max(weight, 0),
  }));

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return randomInt(STABLEFORD_MIN, STABLEFORD_MAX, rng);
  }

  let threshold = rng() * totalWeight;
  for (const entry of entries) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      return entry.value;
    }
  }
  return entries[entries.length - 1]?.value ?? STABLEFORD_MIN;
}

/**
 * Weighted draw using score frequency across subscribers' latest scores.
 * Falls back to uniform random when no score data exists.
 */
export function generateAlgorithmicDraw(
  subscriberScores: number[],
  rng: Rng = defaultRng(),
): number[] {
  if (subscriberScores.length === 0) {
    return generateRandomDraw(rng);
  }

  const frequencies = buildFrequencyMap(subscriberScores);
  const numbers: number[] = [];
  for (let i = 0; i < WINNING_NUMBER_COUNT; i += 1) {
    numbers.push(pickWeightedScore(frequencies, rng));
  }
  return numbers;
}
