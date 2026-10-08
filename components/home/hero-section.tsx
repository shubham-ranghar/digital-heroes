"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Calendar, Heart, Sparkles } from "lucide-react";
import { useRef } from "react";

import { GlassCard } from "@/components/home/glass-card";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/use-count-up";
import type { HomeStats } from "@/lib/home/stats";
import { formatCurrency } from "@/lib/money";
import { bodyLead, headingHero, tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
  stats: HomeStats;
};

export function HeroSection({ stats }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 48]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 24]);

  const raisedTotal = stats.totalRaisedDisplay ?? 0;
  const showRaisedStat = stats.totalRaisedDisplay != null;
  const { formatted } = useCountUp(raisedTotal, {
    decimals: 0,
    enabled: !reduceMotion && showRaisedStat,
  });

  const drawLabel = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
  }).format(new Date(stats.nextDrawDate));

  return (
    <section
      ref={ref}
      className="section-navy hero-glow relative overflow-hidden px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8"
    >
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none absolute -right-20 top-32 size-72 rounded-full bg-coral/20 blur-3xl"
        aria-hidden
      />
      <motion.div
        style={{ y: photoY }}
        className="pointer-events-none absolute -left-16 bottom-10 size-64 rounded-full bg-status-active/15 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative z-10 flex flex-col gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-status-active">
            Charity impact first
          </p>
          <h1 className={headingHero}>
            Your game.{" "}
            <span className="text-coral">Their future.</span>
          </h1>
          <p className={cn("max-w-xl text-slate", bodyLead)}>
            Subscribe, log your last five scores, and enter the monthly draw —
            while a meaningful share of every payment supports the charity you
            choose.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="/subscribe" />}
            >
              Subscribe now
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="#how-it-works" />}
            >
              See how it works
            </Button>
          </div>

          {showRaisedStat ? (
            <div className="flex flex-wrap items-baseline gap-2 border-t border-line pt-6">
              <p className="text-sm text-slate">Raised for partner causes</p>
              <p className={cn("font-sans text-3xl text-coral sm:text-4xl", tabularImpact)}>
                {stats.currencySymbol}
                {formatted}
              </p>
              <p className="text-xs text-muted-on-dark">and growing with every member</p>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 min-h-[420px]">
          <motion.div
            style={{ y: photoY }}
            className="absolute inset-0 grid grid-cols-2 gap-3"
          >
            <div
              className="col-span-2 row-span-2 overflow-hidden rounded-[24px] border border-cream/10 bg-surface/40"
              aria-hidden
            >
              <div className="flex h-full min-h-[200px] flex-col justify-end bg-gradient-to-br from-slate/40 via-navy/60 to-navy p-6">
                <Heart className="mb-3 size-8 text-status-active" aria-hidden />
                <p className="font-sans text-lg text-cream">
                  Real people. Real outcomes.
                </p>
                <p className="mt-1 text-sm text-slate">
                  Community-led charity imagery — warm, human, never fairway cliché.
                </p>
              </div>
            </div>
            <div
              className="overflow-hidden rounded-[20px] border border-cream/10 bg-gradient-to-t from-navy/80 to-coral/10"
              aria-hidden
            />
            <div
              className="overflow-hidden rounded-[20px] border border-cream/10 bg-gradient-to-bl from-status-active/20 to-navy/70"
              aria-hidden
            />
          </motion.div>

          <motion.div
            className="absolute -left-2 top-6 w-[46%] max-w-[200px]"
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <GlassCard>
              <div className="flex items-start gap-2">
                <Heart className="mt-0.5 size-4 shrink-0 text-status-active" aria-hidden />
                <div>
                  <p className="text-xs text-slate">Your charity share</p>
                  <p className="font-sans text-sm text-cream">
                    {stats.charityShareLabel}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            className="absolute right-0 top-1/4 w-[48%] max-w-[210px]"
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <GlassCard>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
                <div>
                  <p className="text-xs text-slate">Next draw</p>
                  <p className={cn("font-sans text-sm text-cream", tabularImpact)}>
                    {stats.daysUntilDraw} days
                  </p>
                  <p className="text-[11px] text-muted-on-dark">{drawLabel}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-1/4 w-[52%] max-w-[220px] -translate-x-1/4"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <GlassCard>
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
                <div>
                  <p className="text-xs text-slate">Jackpot rollover</p>
                  <p className={cn("font-sans text-sm text-coral", tabularImpact)}>
                    {formatCurrency(stats.jackpotRollover, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-[11px] text-muted-on-dark">
                    Unclaimed 5-match tier
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
