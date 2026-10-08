import { previewDrawResult } from "@/lib/draw/simulate";
import type { DrawEntryInput } from "@/lib/draw/types";

export type PublishDrawOutcomeParams = {
  storedWinningNumbers: number[];
  entries: DrawEntryInput[];
  subscriberScores: number[];
  activeSubscribers: number;
  feePerSubscriber: number;
  poolPercentage: number;
  carryover: number;
};

/** Matches, pools, and prize allocations for publish — uses stored winning numbers only. */
export function computePublishDrawOutcome(params: PublishDrawOutcomeParams) {
  const {
    storedWinningNumbers,
    entries,
    subscriberScores,
    activeSubscribers,
    feePerSubscriber,
    poolPercentage,
    carryover,
  } = params;

  if (storedWinningNumbers.length !== 5) {
    throw new Error("Draw is missing simulated winning numbers.");
  }

  return previewDrawResult(storedWinningNumbers, {
    entries,
    subscriberScores,
    activeSubscribers,
    feePerSubscriber,
    poolPercentage,
    carryover,
  });
}
