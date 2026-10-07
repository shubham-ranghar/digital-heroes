"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { ParenLabel } from "@/components/editorial/paren-label";
import { Container } from "@/components/layout/container";
import { editorialDisplayMd } from "@/lib/typography-editorial";
import { motionEase, staggerContainer } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

const tiers = [
  { matches: 3, pct: 25 },
  { matches: 4, pct: 35 },
  { matches: 5, pct: 40, jackpot: true },
];

export function EditorialHowYouWin() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-you-win"
      data-nav-section
      data-nav-theme="light"
      className="bg-cream text-navy"
    >
      <SteppedEdge position="top" color="var(--cream)" />
      <Container className="py-16 sm:py-24">
        <ParenLabel className="text-navy/70">Prizes</ParenLabel>
        <h2 className={cn(editorialDisplayMd, "mt-4 text-navy")}>
          How you <em className="font-serif italic text-navy">win</em>
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-navy/80">
          Match numbers from your five-score entry. Prizes split equally among
          winners at the same tier.
        </p>

        <motion.ul
          className="mt-12 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true }}
        >
          {tiers.map((tier) => (
            <motion.li
              key={tier.matches}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { ease: motionEase } },
              }}
              className={cn(
                "border border-navy/10 bg-[color-mix(in_srgb,var(--cream)_92%,var(--navy)_8%)] p-6",
                tier.jackpot &&
                  "border-coral/50 shadow-[0_0_48px_var(--glow-coral)] md:scale-[1.03]",
              )}
            >
              <p className={cn("font-sans text-4xl font-light text-navy", tabularImpact)}>
                {tier.matches}-match
              </p>
              <p className={cn("mt-2 text-3xl text-coral", tabularImpact)}>
                {tier.pct}%
              </p>
              <p className="mt-2 text-[17px] text-navy/80">of tier pool</p>
              {tier.jackpot ? (
                <p className="mt-4 text-xs uppercase tracking-widest text-coral">
                  Rolls over if unclaimed
                </p>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
      <SteppedEdge position="bottom" color="var(--navy)" />
    </section>
  );
}
