import type { Metadata } from "next";
import { connection } from "next/server";

import { ScoresPanel } from "@/components/scores/scores-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireActiveSubscription } from "@/lib/subscription/access";
import type { ScoreRow } from "@/lib/scores/types";

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

  if (error) {
    throw new Error(error.message);
  }

  const scores = (data ?? []) as ScoreRow[];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SectionHeading
        eyebrow="Gameplay"
        title="Your scores"
        description="One Stableford score per calendar date. We keep your latest five rounds — newest first."
        className="mb-10"
      />
      <ScoresPanel initialScores={scores} />
    </div>
  );
}
