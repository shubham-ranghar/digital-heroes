export type ScoreRecord = {
  id: string;
  played_on: string;
  score: number;
  created_at?: string;
};

const MAX_STORED_SCORES = 5;

/** Newest `played_on` first; ties broken by `created_at` descending. */
export function sortScoresNewestFirst(scores: ScoreRecord[]): ScoreRecord[] {
  return [...scores].sort((a, b) => {
    const byDate = b.played_on.localeCompare(a.played_on);
    if (byDate !== 0) {
      return byDate;
    }
    const aCreated = a.created_at ?? "";
    const bCreated = b.created_at ?? "";
    return bCreated.localeCompare(aCreated);
  });
}

/** Returns the five scores that should remain after the DB retention trigger runs. */
export function keepLatestScores(
  scores: ScoreRecord[],
  limit = MAX_STORED_SCORES,
): ScoreRecord[] {
  return sortScoresNewestFirst(scores).slice(0, limit);
}

/**
 * Simulates insert + unique-per-day replace + five-score cap (matches DB trigger intent).
 */
export function applyScoreRetention(
  existing: ScoreRecord[],
  incoming: ScoreRecord,
  limit = MAX_STORED_SCORES,
): ScoreRecord[] {
  const withoutSameDay = existing.filter(
    (row) =>
      row.id !== incoming.id && row.played_on !== incoming.played_on,
  );
  return keepLatestScores([...withoutSameDay, incoming], limit);
}

/**
 * The oldest kept score that `incoming` would have to beat, or null when it
 * would be retained. `incoming.id` is set on edits so the row being changed
 * doesn't count against itself. Mirrors `scores_reject_outside_latest_five`.
 */
export function findRetentionCutoff(
  existing: ScoreRecord[],
  incoming: Pick<ScoreRecord, "played_on"> & { id?: string },
  limit = MAX_STORED_SCORES,
): ScoreRecord | null {
  const others = existing.filter((row) => row.id !== incoming.id);
  if (others.length < limit) {
    return null;
  }
  const cutoff = sortScoresNewestFirst(others)[limit - 1];
  return incoming.played_on < cutoff.played_on ? cutoff : null;
}

export function findScoreOnDate(
  scores: ScoreRecord[],
  playedOn: string,
): ScoreRecord | undefined {
  return scores.find((row) => row.played_on === playedOn);
}

export const SCORE_SLOT_COUNT = MAX_STORED_SCORES;
