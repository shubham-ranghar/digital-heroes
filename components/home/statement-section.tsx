"use client";

import { LineReveal } from "@/components/motion/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";
import { EDGE_PAD_X, STEP_LINE_GRID } from "@/lib/home/step-line";
import { getMemberImpact } from "@/lib/impact";
import { formatAmount, formatCurrency } from "@/lib/money";
import { getMonthlySubscriptionFeeInr } from "@/lib/subscription/fees";
import { tabularImpact } from "@/lib/typography";
import {
  editorialDisplayMd,
  editorialEyebrow,
  editorialFigure,
  editorialTitle,
} from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

/**
 * The mission in one sentence, then what it buys: the minimum share of one
 * membership as school meals, in figure type on a clay (impact) surface.
 * lg+: sentence on the left of the hero's step line, the outcome hanging off
 * the line and bleeding right. md: stacked, outcome indented to the step.
 */
export function StatementSection() {
  const fee = getMonthlySubscriptionFeeInr();
  const impact = getMemberImpact(fee, MIN_CHARITY_PERCENTAGE);

  return (
    <section
      data-nav-section
      data-nav-theme="light"
      className="flex flex-col justify-center bg-cream py-16 lg:py-24 group-data-pinned/curtain:min-h-svh"
    >
      <div className={cn("grid gap-y-12 lg:items-end", STEP_LINE_GRID)}>
        <LineReveal
          className={cn(
            editorialDisplayMd,
            EDGE_PAD_X,
            "max-w-[22ch] text-navy lg:col-start-2 lg:col-end-5 lg:max-w-none lg:px-0",
          )}
          lineClassName="text-[length:inherit] leading-[inherit]"
          lines={[
            `Every membership sends at least ${MIN_CHARITY_PERCENTAGE}% to your charity,`,
            "and your latest five scores enter the monthly draw.",
          ]}
        />

        <Reveal className="mx-[var(--gutter)] md:mr-0 md:ml-[46%] lg:col-start-6 lg:ml-0">
          <figure className="bg-clay py-8 pr-6 pl-6 text-navy sm:py-10 sm:pr-10 sm:pl-10 md:pr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:pl-12">
            <p className={editorialEyebrow}>One membership, one year</p>
            <p className="mt-4 flex items-baseline gap-4">
              <span className={cn(editorialFigure, "text-navy")}>
                {formatAmount(impact.mealsPerYear)}
              </span>
              <span className={cn(editorialTitle, "max-w-[9ch]")}>school meals</span>
            </p>
            <figcaption className="type-body-sm mt-5 max-w-[40ch] text-navy/85">
              The minimum {MIN_CHARITY_PERCENTAGE}% of a{" "}
              <span className={tabularImpact}>{formatCurrency(fee)}</span> month
              is <span className={tabularImpact}>{formatCurrency(Math.round(impact.yearlyShareInr))}</span>{" "}
              a year: the cost of {formatAmount(impact.mealsPerYear)} mid-day
              meals at an Indian primary school.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
