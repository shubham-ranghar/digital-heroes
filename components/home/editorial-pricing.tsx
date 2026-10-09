"use client";

import Link from "next/link";
import { CalendarCheck, Check, Repeat, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { ImpactCount } from "@/components/home/impact-count";
import { SectionHeadline } from "@/components/motion/section-headline";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";
import { schoolMealsFor, SCHOOL_MEAL_SOURCE } from "@/lib/impact";
import { CURRENCY_SYMBOL, formatAmount, formatMoney } from "@/lib/money";
import { revealDelay } from "@/lib/motion";
import { getSubscriptionFeePaise } from "@/lib/subscription/fees";
import type { SubscriptionPlan } from "@/lib/subscription/types";
import { tabularImpact } from "@/lib/typography";
import {
  editorialDisplayMd,
  editorialEyebrow,
  editorialStatement,
  editorialTitle,
} from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type PlanFeature = { label: string; included: boolean };

type Plan = {
  id: SubscriptionPlan;
  name: string;
  icon: LucideIcon;
  description: string;
  price: string;
  saving: string | null;
  subLine: string;
  /** The plan's minimum charity share, as school meals. */
  outcome: string;
  featureHeading: string;
  features: PlanFeature[];
  recommended: boolean;
};

function buildPlans(): Plan[] {
  const monthlyPaise = getSubscriptionFeePaise("monthly");
  const yearlyPaise = getSubscriptionFeePaise("yearly");
  const savingPaise = Math.max(0, monthlyPaise * 12 - yearlyPaise);
  const saving = savingPaise > 0 ? `Save ${formatMoney(savingPaise)}` : null;
  const minShareInr = (paise: number) =>
    (paise / 100) * (MIN_CHARITY_PERCENTAGE / 100);
  const charityShare = (paise: number) =>
    formatMoney(Math.round(paise * (MIN_CHARITY_PERCENTAGE / 100)));

  return [
    {
      id: "monthly",
      name: "Monthly",
      icon: Repeat,
      description: "Flexible. Cancel any cycle.",
      price: formatMoney(monthlyPaise),
      saving: null,
      subLine: "Billed monthly",
      outcome: `≈ ${formatAmount(schoolMealsFor(minShareInr(monthlyPaise)))} school meals a month`,
      featureHeading: "For flexible members",
      features: [
        { label: "Entry into every monthly draw", included: true },
        {
          label: `Min. ${MIN_CHARITY_PERCENTAGE}% to your chosen charity (${charityShare(monthlyPaise)}+ / cycle)`,
          included: true,
        },
        { label: "Cancel anytime", included: true },
        { label: "No annual saving", included: false },
      ],
      recommended: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      icon: CalendarCheck,
      description: "Commit for a year, give more, pay less.",
      price: formatMoney(yearlyPaise),
      saving,
      subLine: `${formatMoney(Math.round(yearlyPaise / 12))} / month effective, billed annually`,
      outcome: `≈ ${formatAmount(schoolMealsFor(minShareInr(yearlyPaise)))} school meals a year`,
      featureHeading: "For committed members",
      features: [
        { label: "Entry into every monthly draw", included: true },
        {
          label: `Min. ${MIN_CHARITY_PERCENTAGE}% to your chosen charity (${charityShare(yearlyPaise)}+ / year)`,
          included: true,
        },
        ...(saving
          ? [{ label: `${saving} vs 12 monthly payments`, included: true }]
          : []),
        { label: "One payment, twelve draws", included: true },
      ],
      recommended: true,
    },
  ];
}

/** Coral on navy reads navy-on-coral at 4.6:1; white on coral fails AA. */
function SavingBadge({ children }: { children: string }) {
  return (
    <span className="type-caption inline-flex shrink-0 items-center rounded-full bg-coral px-2.5 py-0.5 font-medium text-navy">
      {children}
    </span>
  );
}

function BillingToggle({
  value,
  onChange,
  saving,
}: {
  value: SubscriptionPlan;
  onChange: (plan: SubscriptionPlan) => void;
  saving: string | null;
}) {
  const options: { id: SubscriptionPlan; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  return (
    <div
      role="group"
      aria-label="Billing period"
      className="inline-flex max-w-full items-center rounded-full border border-navy/15 bg-cream p-1"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "type-body-sm motion-interactive motion-press inline-flex h-10 items-center gap-2 rounded-full px-4 font-medium sm:px-5",
              selected ? "bg-navy text-cream" : "text-navy hover:bg-navy/5",
            )}
          >
            {option.label}
            {option.id === "yearly" && saving ? <SavingBadge>{saving}</SavingBadge> : null}
          </button>
        );
      })}
    </div>
  );
}

function FeatureMark({ included }: { included: boolean }) {
  return (
    <span
      className={cn(
        "mt-[0.2em] inline-flex size-[18px] shrink-0 items-center justify-center rounded-full",
        included ? "bg-coral text-navy" : "bg-current opacity-25",
      )}
      aria-hidden
    >
      {included ? <Check className="size-3" strokeWidth={3} /> : null}
    </span>
  );
}

/** Rows per card: the subgrid spans exactly this many, so both cards align. */
const PLAN_ROWS = "md:row-span-10";

function PlanCard({
  plan,
  selected,
  index,
}: {
  plan: Plan;
  selected: boolean;
  index: number;
}) {
  const Icon = plan.icon;
  const inverted = plan.recommended;
  const muted = inverted ? "text-on-dark-quiet" : "text-navy/75";

  return (
    // Ten subgrid rows on desktop, so every row (and the CTA) lines up across
    // both cards whatever wraps. Below md the cards stack, Yearly first.
    //
    // Stepped corner (3.3): the frame is the grid item, clipped, with a 2px
    // padding whose colour is the border; the content layer inside takes the
    // same clip, so the border follows the steps. A clip-path also clips
    // `outline`, so selection shows as the frame turning coral.
    <RevealStaggerItem
      revealDelaySec={revealDelay(index)}
      className={cn(
        "clip-stepped-corner flex flex-col p-0.5 md:grid md:grid-rows-subgrid md:gap-0",
        PLAN_ROWS,
        "motion-transition-colors",
        selected ? "bg-coral" : inverted ? "bg-navy" : "bg-navy/15",
        inverted && "max-md:order-first",
      )}
    >
      <div
        className={cn(
          "clip-stepped-corner flex flex-1 flex-col p-7 md:grid md:grid-rows-subgrid md:gap-0 md:p-10",
          PLAN_ROWS,
          inverted ? "bg-navy text-cream" : "bg-cream text-navy",
        )}
      >
        {/* Reserved top row: the badge lives beside the icon, never over the name.
            Right padding keeps it clear of the stepped corner. */}
        <div className="flex min-h-11 items-center justify-between gap-3 pr-6">
          <span
            className="inline-flex size-11 items-center justify-center rounded-full border border-current/15"
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={1.5} />
          </span>
          {plan.recommended ? (
            <span className={cn(editorialEyebrow, "rounded-full bg-coral px-3 py-1 text-navy")}>
              Best value
            </span>
          ) : null}
        </div>

        <h3 className={cn(editorialTitle, "mt-6")}>
          {plan.name}
          {selected ? <span className="sr-only"> (selected)</span> : null}
        </h3>
        <p className={cn("type-body-sm mt-2", muted)}>{plan.description}</p>

        <div className="my-6 h-px bg-current/12" aria-hidden />

        <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className={cn(editorialStatement, tabularImpact)}>{plan.price}</span>
          {plan.saving ? <SavingBadge>{plan.saving}</SavingBadge> : null}
        </p>
        <p className={cn("type-body-sm mt-3", muted)}>{plan.subLine}</p>

        {/* Impact surface (clay): the plan's minimum share, as meals. */}
        <p className="mt-6 bg-clay px-4 py-3 text-navy">
          <span className={cn(editorialEyebrow, "block text-navy/80")}>
            Your {MIN_CHARITY_PERCENTAGE}%, at minimum
          </span>
          <span className={cn(editorialTitle, "mt-1 block", tabularImpact)}>
            {plan.outcome}
          </span>
        </p>

        <div className="mt-8">
          <Link
            href="/subscribe"
            aria-label={`Subscribe ${plan.name.toLowerCase()}`}
            className={cn(
              "type-body-sm motion-press flex h-12 w-full items-center justify-center rounded-full font-medium",
              plan.recommended
                ? "motion-cta bg-coral text-navy hover:bg-[color-mix(in_srgb,var(--coral)_85%,white)]"
                : "motion-interactive border border-navy text-navy hover:bg-navy/5",
            )}
          >
            Subscribe
          </Link>
        </div>

        <p className="type-body-sm mt-8 font-medium">{plan.featureHeading}</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li
              key={feature.label}
              className={cn(
                "type-body-sm flex gap-3",
                !feature.included && (inverted ? "text-on-dark-quiet" : "text-navy/65"),
              )}
            >
              <FeatureMark included={feature.included} />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </RevealStaggerItem>
  );
}

type EditorialPricingProps = {
  /** Cumulative raised (₹), or null when it can't be computed honestly. */
  totalRaised: number | null;
};

export function EditorialPricing({ totalRaised }: EditorialPricingProps) {
  const [billing, setBilling] = useState<SubscriptionPlan>("yearly");
  const plans = buildPlans();
  const yearlySaving = plans.find((plan) => plan.id === "yearly")?.saving ?? null;

  return (
    <section
      id="pricing"
      data-nav-section
      data-nav-theme="light"
      className="bg-cream py-16 text-navy sm:py-24"
    >
      <Container>
        <SectionHeadline
          label="Pricing"
          labelClassName="text-navy/70"
          headlineClassName={cn(editorialDisplayMd, "text-navy")}
          lines={[<>Membership that gives back</>]}
        />

        <div className="mt-10 flex justify-center">
          <BillingToggle value={billing} onChange={setBilling} saving={yearlySaving} />
        </div>

        <RevealStagger className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-x-6 md:gap-y-0">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              selected={billing === plan.id}
            />
          ))}
        </RevealStagger>

        <p className="type-caption mx-auto mt-6 max-w-5xl text-center text-navy/70">
          Meal figures: {SCHOOL_MEAL_SOURCE}. Your charity spends on its own
          programmes; meals are a measure, not a promise.
        </p>

        {totalRaised != null ? (
          <p
            className={cn(
              editorialStatement,
              "mx-auto mt-16 max-w-4xl text-center sm:mt-20",
            )}
          >
            Together, members have raised{" "}
            <ImpactCount
              className="font-medium text-coral-deep"
              prefix={CURRENCY_SYMBOL}
              value={totalRaised}
              format={formatAmount}
            />{" "}
            for partner causes.
          </p>
        ) : null}
      </Container>
    </section>
  );
}
