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

export function findScoreOnDate(
  scores: ScoreRecord[],
  playedOn: string,
): ScoreRecord | undefined {
  return scores.find((row) => row.played_on === playedOn);
}

export const SCORE_SLOT_COUNT = MAX_STORED_SCORES;
