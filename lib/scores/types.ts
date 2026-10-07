import type { ScoreRecord } from "@/lib/scores/rolling";

export type ScoreRow = ScoreRecord & {
  user_id: string;
};

export type ScoreActionResult =
  | { ok: true; scores: ScoreRow[] }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
      duplicate?: ScoreRow;
    };
