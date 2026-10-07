"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { formatPlayedOnLabel } from "@/lib/scores/dates";
import type { ScoreRow } from "@/lib/scores/types";
import { SCORE_SLOT_COUNT } from "@/lib/scores/rolling";
import { layoutSpring } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type ScoreChipsProps = {
  scores: ScoreRow[];
};

export function ScoreChips({ scores }: ScoreChipsProps) {
  const reduceMotion = useReducedMotion();
  const slots = Array.from({ length: SCORE_SLOT_COUNT }, (_, index) => {
    return scores[index] ?? null;
  });

  return (
    <motion.ul
      layout={!reduceMotion}
      className="grid grid-cols-2 gap-3 sm:grid-cols-5"
      aria-label="Latest five scores"
    >
      <AnimatePresence initial={false}>
        {slots.map((score, index) => (
          <motion.li
            key={score?.id ?? `empty-${index}`}
            layout={!reduceMotion}
            transition={reduceMotion ? undefined : layoutSpring}
            className="min-h-[5.5rem]"
          >
            {score ? (
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center rounded-[20px] border border-line bg-surface px-3 py-4 text-center shadow-none",
                  tabularImpact,
                )}
              >
                <span className="font-sans text-2xl font-semibold text-coral">
                  {score.score}
                </span>
                <span className="mt-1 text-xs text-slate">
                  {formatPlayedOnLabel(score.played_on)}
                </span>
              </div>
            ) : (
              <div
                className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-slate/45 bg-sand/40 px-3 py-4 text-center"
                aria-hidden
              >
                <span className="text-xs text-slate/70">Empty slot</span>
              </div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
