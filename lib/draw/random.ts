import {
  STABLEFORD_MAX,
  STABLEFORD_MIN,
  WINNING_NUMBER_COUNT,
} from "@/lib/draw/constants";
import { defaultRng, randomInt, type Rng } from "@/lib/draw/rng";

/**
 * Lottery-style draw: five independent random Stableford values (1–45).
 * Duplicates are allowed, matching numbered-ball draws.
 */
export function generateRandomDraw(rng: Rng = defaultRng()): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < WINNING_NUMBER_COUNT; i += 1) {
    numbers.push(randomInt(STABLEFORD_MIN, STABLEFORD_MAX, rng));
  }
  return numbers;
}
