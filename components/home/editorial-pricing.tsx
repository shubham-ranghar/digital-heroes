"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { ParenLabel } from "@/components/editorial/paren-label";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";
import { formatMoney } from "@/lib/money";
import {
  getMonthlySubscriptionFeeInr,
  getSubscriptionFeePaise,
} from "@/lib/subscription/fees";
import { editorialDisplayMd } from "@/lib/typography-editorial";
import { buttonMotionProps } from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

export function EditorialPricing() {
  const reduceMotion = useReducedMotion();
  const monthlyInr = getMonthlySubscriptionFeeInr();
  const monthlyPaise = monthlyInr * 100;
  const yearlyPaise = getSubscriptionFeePaise("yearly");
  const monthlyCharity = formatMoney(
    Math.round(monthlyPaise * (MIN_CHARITY_PERCENTAGE / 100)),
  );
  const yearlyCharity = formatMoney(
    Math.round(yearlyPaise * (MIN_CHARITY_PERCENTAGE / 100)),
  );
  const yearlySavingsPaise = monthlyPaise * 12 - yearlyPaise;
  const effectiveMonthlyPaise = Math.round(yearlyPaise / 12);

  const plans = [
    {
      name: "Monthly",
      price: formatMoney(monthlyPaise),
      note: `${monthlyCharity}+ to your cause / cycle`,
      best: false,
    },
    {
      name: "Yearly",
      price: formatMoney(yearlyPaise),
      note: `Min. ${MIN_CHARITY_PERCENTAGE}% charity share (${yearlyCharity}+ / year)`,
      saving: `Save ${formatMoney(yearlySavingsPaise)} vs 12 monthly payments`,
      effective: `${formatMoney(effectiveMonthlyPaise)} / month effective`,
      best: true,
    },
  ];

  return (
    <section
      id="pricing"
      data-nav-section
      data-nav-theme="light"
      className="bg-cream py-16 text-navy sm:py-24"
    >
      <Container>
        <Reveal>
          <ParenLabel className="text-navy/70">Pricing</ParenLabel>
          <h2 className={cn(editorialDisplayMd, "mt-4")}>
            Membership that <em className="font-serif italic text-navy">gives back</em>
          </h2>
        </Reveal>

        <RevealStagger className="mt-12 grid gap-6 md:grid-cols-2 md:items-stretch" stagger={0.1}>
          {plans.map((plan) => (
            <RevealStaggerItem key={plan.name}>
              <div
                className={cn(
                  "motion-card-hover relative flex h-full flex-col border p-8",
                  plan.best
                    ? "border-2 border-navy bg-sand"
                    : "border border-navy",
                )}
              >
                {plan.best ? (
                  <span
                    className="absolute left-6 top-0 -translate-y-1/2 bg-coral px-3 py-1 text-[12px] font-medium uppercase tracking-[0.1em] text-navy"
                  >
                    Best value
                  </span>
                ) : null}
                <h3 className="text-xl font-light">{plan.name}</h3>
                <p className={cn("mt-4 text-4xl font-light text-navy", tabularImpact)}>
                  {plan.price}
                </p>
                {plan.saving ? (
                  <p className="mt-2 text-[17px] text-navy/80">{plan.saving}</p>
                ) : null}
                {plan.effective ? (
                  <p className="mt-1 text-[17px] text-navy/80">{plan.effective}</p>
                ) : null}
                <p className="mt-2 text-[17px] text-navy/80">{plan.note}</p>
                <motion.div className="mt-auto pt-8" {...buttonMotionProps(reduceMotion)}>
                  <Link
                    href="/subscribe"
                    className={cn(
                      "flex h-11 w-full items-center justify-center text-sm font-medium motion-transition-colors",
                      plan.best
                        ? "bg-coral text-navy hover:bg-coral-deep"
                        : "border border-navy bg-transparent text-navy hover:bg-navy/5",
                    )}
                  >
                    Subscribe
                  </Link>
                </motion.div>
              </div>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </Container>
      <SteppedEdge position="bottom" color="var(--navy)" />
    </section>
  );
}
