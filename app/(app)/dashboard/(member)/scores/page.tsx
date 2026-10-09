import type { Metadata } from "next";
import { connection } from "next/server";

import { ScoresLoadError } from "@/components/scores/scores-load-error";
import { ScoresPanel } from "@/components/scores/scores-panel";
import { AppPageHeading } from "@/components/layout/app-page-heading";
import { requireActiveSubscription } from "@/lib/subscription/access";
import type { ScoreRow } from "@/lib/scores/types";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Scores",
};

export const instant = false;

export default async function ScoresPage() {
  await connection();
  const { supabase, user } = await requireActiveSubscription();

  const { data, error } = await supabase
    .from("scores")
    .select("id, user_id, score, played_on, created_at")
    .eq("user_id", user.id)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false });

  const scores = (data ?? []) as ScoreRow[];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Reveal trigger="mount" fast>
        <AppPageHeading
          label="Gameplay"
          title={<>Your <em>scores</em></>}
          description="One Stableford score per calendar date. We keep your latest five rounds — newest first."
          className="mb-10"
        />
      </Reveal>
      {error ? (
        <ScoresLoadError message={error.message} />
      ) : (
        <ScoresPanel initialScores={scores} />
      )}
    </div>
  );
}
