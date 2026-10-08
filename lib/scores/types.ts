import type { ScoreRecord } from "@/lib/scores/rolling";

export type ScoreWriteFailure = "duplicate_date" | "outside_latest_five";

export type ScoreRow = ScoreRecord & {
  user_id: string;
};

export type ScoreActionResult =
  | { ok: true; scores: ScoreRow[] }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
      /** Distinguishes the two date failures so the UI can react differently. */
      reason?: ScoreWriteFailure;
      duplicate?: ScoreRow;
    };
