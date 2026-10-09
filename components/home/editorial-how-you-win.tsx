"use client";

import { SectionHeadline } from "@/components/motion/section-headline";
import { EditorialCard } from "@/components/ui/editorial-card";
import { EDGE_PAD_X, STEP_LINE_GRID } from "@/lib/home/step-line";
import {
  editorialBody,
  editorialDisplayMd,
  editorialFigure,
  editorialStatement,
  editorialTitle,
} from "@/lib/typography-editorial";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

const tiers = [
  { matches: 3, pct: 25 },
  { matches: 4, pct: 35 },
] as const;

const jackpot = { matches: 5, pct: 40 };

// Podium heights (lg+): a base that tracks the pinned frame's height, then
// one 48px step per tier. Short laptops stay within the curtain's pin budget.
const PODIUM_3 = "lg:min-h-[clamp(12rem,30svh,18rem)]";
const PODIUM_4 = "lg:min-h-[calc(clamp(12rem,30svh,18rem)+3rem)]";
const PODIUM_5 = "lg:min-h-[calc(clamp(12rem,30svh,18rem)+6rem)]";

/**
 * lg+: a podium on a shared baseline. 3- and 4-match sit left of the hero's
 * step line, rising one 48px step each (How it works steps down by the same
 * amount); 5-match fills the step column, bleeds right and rises a further
 * step, its stepped corner cut larger than the small tiers'.
 * md: 3 + 4 side by side, 5-match full width beneath, bleeding right.
 * <md: single column inside the gutters, no offsets or bleed.
 */
export function EditorialHowYouWin() {
  return (
    <section
      id="how-you-win"
      data-nav-section
      data-nav-theme="light"
      className="flex flex-col justify-center bg-cream py-16 text-navy lg:py-20 group-data-pinned/curtain:min-h-svh"
    >
      <div
        className={cn(
          "grid gap-y-6 md:gap-y-8 lg:items-end lg:gap-y-14",
          STEP_LINE_GRID,
        )}
      >
        <div className={cn(EDGE_PAD_X, "lg:col-start-2 lg:col-end-5 lg:px-0")}>
          <SectionHeadline
            align="left"
            label="Prizes"
            labelClassName="text-navy/70"
            headlineClassName={cn(editorialDisplayMd, "text-navy text-balance")}
            lines={[
              <>How you win</>,
            ]}
          />
        </div>
        <p
          className={cn(
            EDGE_PAD_X,
            "md:pl-[46%] lg:col-start-6 lg:pl-0",
          )}
        >
          <span className={cn(editorialBody, "block max-w-[42ch]")}>
            Match numbers from your five-score entry. Prizes split equally among
            winners at the same tier.
          </span>
        </p>

        <ul
          className={cn(
            EDGE_PAD_X,
            "mt-4 grid gap-6 md:mt-4 md:grid-cols-2 lg:col-span-full lg:mt-0 lg:grid-cols-subgrid lg:items-end lg:gap-0 lg:px-0",
          )}
        >
          {tiers.map((tier) => (
            <li
              key={tier.matches}
              className={cn(
                "motion-card-hover drop-shadow-[0_4px_12px_rgba(20,33,61,0.08)]",
                tier.matches === 3 ? "lg:col-start-2" : "lg:col-start-4",
              )}
            >
              <EditorialCard
                borderClassName="bg-navy/80"
                className={cn(
                  "bg-cream p-6 text-navy",
                  tier.matches === 3 ? PODIUM_3 : PODIUM_4,
                )}
              >
                <p className={cn(editorialTitle, tabularImpact)}>
                  {tier.matches}-match
                </p>
                <p className={cn(editorialStatement, "mt-3 text-coral-deep", tabularImpact)}>
                  {tier.pct}%
                </p>
                <p className="type-body-sm mt-1 text-navy/80">of the prize pool</p>
              </EditorialCard>
            </li>
          ))}

          <li className="motion-card-hover mt-2 drop-shadow-[0_12px_28px_rgba(20,33,61,0.18)] md:col-span-2 md:-mr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:col-span-1 lg:col-start-6 lg:mt-0 lg:mr-0">
            <EditorialCard
              step={24}
              borderClassName="bg-navy"
              className={cn(
                PODIUM_5,
                "flex flex-col justify-between bg-navy p-6 text-cream sm:p-8 md:pr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:pl-10 lg:pt-10",
              )}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className={cn(editorialStatement, "whitespace-nowrap", tabularImpact)}>
                    {jackpot.matches}-match
                  </p>
                  <p className="type-body-sm mt-2 text-on-dark-body">of the prize pool</p>
                </div>
                <p className={cn(editorialFigure, "text-coral")}>
                  {jackpot.pct}%
                </p>
              </div>
              <p className="type-eyebrow mt-8 border-t border-cream/20 pt-4 text-on-dark-body">
                Rolls over if unclaimed
              </p>
            </EditorialCard>
          </li>
        </ul>
      </div>
    </section>
  );
}
