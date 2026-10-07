"use client";

import { SectionHeadline } from "@/components/motion/section-headline";
import { Container } from "@/components/layout/container";
import { EditorialCard } from "@/components/ui/editorial-card";
import { editorialDisplayMd } from "@/lib/typography-editorial";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

const tiers = [
  { matches: 3, pct: 25 },
  { matches: 4, pct: 35 },
  { matches: 5, pct: 40, jackpot: true },
];

export function EditorialHowYouWin() {
  return (
    <section
      id="how-you-win"
      data-nav-section
      data-nav-theme="light"
      className="bg-cream text-navy"
    >
      <Container className="py-16 sm:py-24">
        <SectionHeadline
          label="Prizes"
          labelClassName="text-navy/70"
          headlineClassName={cn(editorialDisplayMd, "text-navy text-balance")}
          lines={[
            <>
              How you <em>win</em>
            </>,
          ]}
        />
        <p className="mx-auto mt-4 max-w-[60ch] text-balance text-center text-[17px] leading-relaxed text-navy/80">
          Match numbers from your five-score entry. Prizes split equally among
          winners at the same tier.
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <li key={tier.matches}>
              <EditorialCard
                notch="top"
                borderClassName={tier.jackpot ? "bg-cream/30" : "bg-navy"}
                className={cn(
                  "motion-card-hover p-6",
                  tier.jackpot
                    ? "bg-navy text-cream"
                    : "bg-cream text-navy",
                )}
              >
                <p
                  className={cn(
                    "font-sans text-4xl font-light",
                    tier.jackpot ? "text-cream" : "text-navy",
                    tabularImpact,
                  )}
                >
                  {tier.matches}-match
                </p>
                <p
                  className={cn(
                    "mt-2 font-serif italic text-coral",
                    tier.jackpot ? "text-[3rem] leading-none" : "text-3xl",
                    tabularImpact,
                  )}
                >
                  {tier.pct}%
                </p>
                <p
                  className={cn(
                    "mt-2 text-[17px]",
                    tier.jackpot ? "text-cream/80" : "text-navy/80",
                  )}
                >
                  of tier pool
                </p>
                {tier.jackpot ? (
                  <p className="mt-4 text-[13px] uppercase tracking-widest text-cream/80">
                    Rolls over if unclaimed
                  </p>
                ) : null}
              </EditorialCard>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
