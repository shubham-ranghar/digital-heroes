"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { formatPlayedOnLabel } from "@/lib/scores/dates";
import type { ScoreRow } from "@/lib/scores/types";
import { SCORE_SLOT_COUNT } from "@/lib/scores/rolling";
import { layoutSpring } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";

type ScoreChipsProps = {
  scores: ScoreRow[];
  /** Row just saved — briefly highlighted. */
  highlightId?: string | null;
  /** Stagger the chips in on mount (full scores page only). */
  staggerIn?: boolean;
};

export function ScoreChips({
  scores,
  highlightId,
  staggerIn = false,
}: ScoreChipsProps) {
  const reduceMotion = useReducedMotion();
  const slots = Array.from({ length: SCORE_SLOT_COUNT }, (_, index) => {
    return scores[index] ?? null;
  });

  const chipList = (
    <m.ul
      layout={!reduceMotion}
      className="grid grid-cols-2 gap-3 sm:grid-cols-5"
      aria-label="Latest five scores"
    >
      <AnimatePresence initial={false}>
        {slots.map((score, index) => (
          <m.li
            key={score?.id ?? `empty-${index}`}
            layout={!reduceMotion}
            transition={reduceMotion ? undefined : layoutSpring}
            className="min-h-[5.5rem]"
          >
            <ChipEntry stagger={staggerIn}>
            {score ? (
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center rounded-[20px] border border-line bg-surface px-3 py-4 text-center shadow-[var(--shadow-resting)] motion-interactive",
                  index === 0 && "border-coral/30",
                  score.id === highlightId &&
                    "motion-pop-in border-coral ring-4 ring-coral/15",
                  tabularImpact,
                )}
              >
                {index === 0 ? (
                  <span className="mb-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-slate">
                    Latest
                  </span>
                ) : null}
                <span className="font-sans text-2xl font-semibold text-coral">
                  {score.score}
                </span>
                <span className="mt-1 text-xs text-slate">
                  {formatPlayedOnLabel(score.played_on)}
                </span>
              </div>
            ) : (
              <div
                className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-slate/35 bg-sand/30 px-3 py-4 text-center"
                aria-hidden
              >
                <span className="text-xs text-slate/70">Empty slot</span>
              </div>
            )}
            </ChipEntry>
          </m.li>
        ))}
      </AnimatePresence>
    </m.ul>
  );

  return staggerIn ? (
    <RevealStagger trigger="mount" stagger={0.06}>
      {chipList}
    </RevealStagger>
  ) : (
    chipList
  );
}

/** Item wrapper only when staggering; the `m.li` keeps owning layout motion. */
function ChipEntry({
  stagger,
  children,
}: {
  stagger: boolean;
  children: React.ReactNode;
}) {
  return stagger ? (
    <RevealStaggerItem fast className="h-full">
      {children}
    </RevealStaggerItem>
  ) : (
    children
  );
}
