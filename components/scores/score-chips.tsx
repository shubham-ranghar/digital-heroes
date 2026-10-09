"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { formatPlayedOnLabel } from "@/lib/scores/dates";
import type { ScoreRow } from "@/lib/scores/types";
import { SCORE_SLOT_COUNT } from "@/lib/scores/rolling";
import { layoutSpring } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { editorialKeyNumber } from "@/lib/typography-editorial";
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
                  // The LATEST chip is navy on every surface (overview and
                  // scores page), so the same component never has two looks.
                  "flex h-full flex-col items-center justify-center rounded-[20px] border border-line bg-surface px-3 py-4 text-center shadow-[var(--shadow-resting)] motion-interactive",
                  index === 0 && "section-navy border-navy bg-navy",
                  score.id === highlightId &&
                    "motion-pop-in border-coral ring-4 ring-coral/15",
                  tabularImpact,
                )}
              >
                {index === 0 ? (
                  <span className="mb-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-cream/75">
                    Latest
                  </span>
                ) : null}
                <span className={cn("text-3xl", editorialKeyNumber)}>
                  {score.score}
                </span>
                <span
                  className={cn(
                    "mt-1 text-xs",
                    index === 0 ? "text-cream/75" : "text-slate",
                  )}
                >
                  {formatPlayedOnLabel(score.played_on)}
                </span>
              </div>
            ) : (
              // Empty slots name their round so a fresh dashboard still
              // teaches the five-round mechanic.
              <div
                className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-slate/35 bg-sand/30 px-3 py-4 text-center"
                aria-hidden
              >
                <span className="text-xs font-medium text-slate/80">
                  Round {index + 1}
                </span>
                <span className="mt-1 text-[0.625rem] text-slate/60">
                  Not logged yet
                </span>
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
