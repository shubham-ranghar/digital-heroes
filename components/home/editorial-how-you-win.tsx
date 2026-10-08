"use client";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { SectionHeadline } from "@/components/motion/section-headline";
import { EditorialCard } from "@/components/ui/editorial-card";
import { EDGE_PAD_X, STEP_LINE_GRID } from "@/lib/home/step-line";
import { editorialDisplayMd } from "@/lib/typography-editorial";
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
 * step under a stepped crown, the inverse of the small tiers' notch.
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
              <>
                How you <em>win</em>
              </>,
            ]}
          />
        </div>
        <p
          className={cn(
            EDGE_PAD_X,
            "text-[17px] leading-relaxed text-navy/80 md:pl-[46%] lg:col-start-6 lg:pl-0",
          )}
        >
          <span className="block max-w-[42ch]">
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
                notch="top"
                borderClassName="rounded-[20px] bg-navy"
                className={cn(
                  "rounded-[19px] bg-cream p-6 text-navy",
                  tier.matches === 3 ? PODIUM_3 : PODIUM_4,
                )}
              >
                <p className={cn("font-sans text-4xl font-light", tabularImpact)}>
                  {tier.matches}-match
                </p>
                <p className={cn("mt-2 font-serif text-3xl italic text-coral", tabularImpact)}>
                  {tier.pct}%
                </p>
                <p className="mt-2 text-[17px] text-navy/80">of tier pool</p>
              </EditorialCard>
            </li>
          ))}

          <li className="motion-card-hover mt-2 md:col-span-2 md:-mr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:col-span-1 lg:col-start-6 lg:mt-0 lg:mr-0">
            <SteppedEdge
              position="top"
              color="var(--navy)"
              fillBand={false}
              static
              className="mx-auto w-1/3 [--step-edge:10px] md:[--step-edge:12px]"
            />
            <div
              data-nav-theme="dark"
              className={cn(
                PODIUM_5,
                "flex flex-col justify-between rounded-[20px] bg-navy p-6 text-cream shadow-raised sm:p-8 md:rounded-r-none md:pr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:pl-10 lg:pt-10",
              )}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p
                    className={cn(
                      "whitespace-nowrap font-sans text-4xl font-light sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl",
                      tabularImpact,
                    )}
                  >
                    {jackpot.matches}-match
                  </p>
                  <p className="mt-3 text-[17px] text-cream/80">of tier pool</p>
                </div>
                <p
                  className={cn(
                    "font-serif text-[clamp(4rem,7vw,7rem)] italic leading-none text-coral",
                    tabularImpact,
                  )}
                >
                  {jackpot.pct}%
                </p>
              </div>
              <p className="mt-8 border-t border-cream/20 pt-4 text-[13px] uppercase tracking-widest text-cream/80">
                Rolls over if unclaimed
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
