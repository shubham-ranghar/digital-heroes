import { formatPlayedOnLabel } from "@/lib/scores/dates";
import { SCORE_SLOT_COUNT } from "@/lib/scores/rolling";
import type { ScoreWriteFailure } from "@/lib/scores/types";

/** Unique violation on scores_one_per_user_per_day. */
const DUPLICATE_DATE_SQLSTATE = "23505";
/** Raised by the scores_reject_outside_latest_five trigger. */
const OUTSIDE_LATEST_FIVE_SQLSTATE = "DH001";

type Subject = "self" | "admin";

export type ScoreWriteError = {
  reason: ScoreWriteFailure;
  message: string;
  fieldError: string;
};

export function duplicateDateError(subject: Subject): ScoreWriteError {
  return {
    reason: "duplicate_date",
    message:
      subject === "self"
        ? "You already logged a score for this date."
        : "This member already has a score for that date.",
    fieldError: "One score per calendar date",
  };
}

/** `cutoffPlayedOn` is the oldest kept date, when known. */
export function outsideLatestFiveError(
  subject: Subject,
  cutoffPlayedOn?: string,
): ScoreWriteError {
  const who = subject === "self" ? "You already have" : "This member already has";
  const oldest = cutoffPlayedOn
    ? ` (oldest kept: ${formatPlayedOnLabel(cutoffPlayedOn)})`
    : "";
  return {
    reason: "outside_latest_five",
    message: `${who} ${SCORE_SLOT_COUNT} more recent scores${oldest}. Delete an older entry first, or pick a more recent date.`,
    fieldError: cutoffPlayedOn
      ? `Must be after ${formatPlayedOnLabel(cutoffPlayedOn)}`
      : "Older than your latest five scores",
  };
}

/** Map a Postgres error from a scores write to a user-facing failure, if known. */
export function mapScoreWriteError(
  error: { code?: string } | null,
  subject: Subject,
): ScoreWriteError | null {
  switch (error?.code) {
    case DUPLICATE_DATE_SQLSTATE:
      return duplicateDateError(subject);
    case OUTSIDE_LATEST_FIVE_SQLSTATE:
      return outsideLatestFiveError(subject);
    default:
      return null;
  }
}
