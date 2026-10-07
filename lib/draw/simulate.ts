import { generateAlgorithmicDraw } from "@/lib/draw/algorithmic";
import type { DrawEntryInput, DrawSimulationResult } from "@/lib/draw/types";
import { generateRandomDraw } from "@/lib/draw/random";
import { matchEntries } from "@/lib/draw/match";
import { calculatePrizePools, splitPrizes } from "@/lib/draw/pools";
import type { Rng } from "@/lib/draw/rng";

export type DrawMode = "random" | "algorithmic";

export type SimulateDrawParams = {
  mode: DrawMode;
  entries: DrawEntryInput[];
  /** Flat list of latest subscriber scores for algorithmic weighting. */
  subscriberScores: number[];
  activeSubscribers: number;
  feePerSubscriber: number;
  poolPercentage: number;
  carryover: number;
  rng?: Rng;
};

/** End-to-end draw simulation (pure, testable). */
export function simulateDraw(params: SimulateDrawParams): DrawSimulationResult {
  const rng = params.rng;
  const winningNumbers =
    params.mode === "algorithmic"
      ? generateAlgorithmicDraw(params.subscriberScores, rng)
      : generateRandomDraw(rng);

  const matches = matchEntries(params.entries, winningNumbers);
  const pools = calculatePrizePools(
    params.activeSubscribers,
    params.feePerSubscriber,
    params.poolPercentage,
    params.carryover,
  );
  const prizes = splitPrizes(pools, matches);

  return {
    winningNumbers,
    matches,
    pools,
    prizes,
  };
}

/** Recompute pools and winners for already-chosen winning numbers (post-simulation preview). */
export function previewDrawResult(
  winningNumbers: number[],
  params: Omit<SimulateDrawParams, "mode" | "rng">,
): DrawSimulationResult {
  const matches = matchEntries(params.entries, winningNumbers);
  const pools = calculatePrizePools(
    params.activeSubscribers,
    params.feePerSubscriber,
    params.poolPercentage,
    params.carryover,
  );
  const prizes = splitPrizes(pools, matches);

  return {
    winningNumbers,
    matches,
    pools,
    prizes,
  };
}
