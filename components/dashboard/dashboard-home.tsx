"use client";

import Link from "next/link";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  Sparkles,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";

import { DrawStatusSteps } from "@/components/draw/draw-status-steps";
import { DashboardCharityCard } from "@/components/dashboard/dashboard-charity-card";
import { CountUpCurrency } from "@/components/draw/count-up-currency";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { BentoCard } from "@/components/dashboard/bento-card";
import { SubscriptionAccessPill } from "@/components/subscription/subscription-access-pill";
import { BillingManageButtons } from "@/components/subscription/billing-manage-buttons";
import { getSubscriptionAccessLabel } from "@/lib/subscription/grants";
import { ScoresPanel } from "@/components/scores/scores-panel";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  DashboardCharity,
  DashboardParticipation,
  DashboardWinnings,
} from "@/lib/dashboard/queries";
import {
  Reveal,
  RevealStagger,
  RevealStaggerItem,
} from "@/components/motion/reveal";
import { useCountUp } from "@/hooks/use-count-up";
import type { ScoreRow } from "@/lib/scores/types";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import type { PlanPriceDisplay } from "@/lib/payments/prices";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

export type DashboardHomeProps = {
  displayName: string | null;
  email: string;
  hasAccess: boolean;
  isAdmin: boolean;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | "none";
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  hasBillingSubscription: boolean;
  charity: DashboardCharity;
  scores: ScoreRow[];
  participation: DashboardParticipation;
  winnings: DashboardWinnings;
  prices: PlanPriceDisplay;
};

export function DashboardHome(props: DashboardHomeProps) {
  const accessLabel = getSubscriptionAccessLabel(
    props.status === "none"
      ? null
      : {
          status: props.status,
          renewal_date: props.renewalDate,
          cancel_at_period_end: props.cancelAtPeriodEnd,
        },
    props.hasAccess,
  );

  const title = props.displayName
    ? `Hello, ${props.displayName}`
    : "Your dashboard";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Reveal trigger="mount" fast className="mb-8">
      <header>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium uppercase tracking-widest text-slate">
                Member
              </p>
              <SubscriptionAccessPill label={accessLabel} />
            </div>
            <h1 className="mt-2 font-sans text-3xl text-navy sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {props.hasAccess
                ? "Your scores, draws, and charity impact — all in one place."
                : "Your charity and winnings stay visible here. Subscribe to log scores and enter draws."}
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            render={
              <Link href={props.hasAccess ? "/dashboard/scores" : "/subscribe"} />
            }
          >
            {props.hasAccess ? "Log a round" : "Subscribe now"}
            <ArrowRight
              className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/button:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden
            />
          </Button>
        </div>
      </header>
      </Reveal>

      <RevealStagger
        trigger="mount"
        stagger={0.06}
        className="grid auto-rows-min gap-4 md:grid-cols-12"
      >
        <RevealStaggerItem fast className="min-w-0 md:col-span-4">
          <BentoCard title="Subscription" icon={CreditCard}>
            <SubscriptionSummary
              hasAccess={props.hasAccess}
              plan={props.plan}
              email={props.email}
              renewalDate={props.renewalDate}
              cancelAtPeriodEnd={props.cancelAtPeriodEnd}
              hasBillingSubscription={props.hasBillingSubscription}
              prices={props.prices}
            />
          </BentoCard>
        </RevealStaggerItem>

        <RevealStaggerItem fast className="min-w-0 md:col-span-8">
          <BentoCard
            title="Stableford scores"
            icon={Target}
            emphasis={props.hasAccess}
            headerAction={
              props.hasAccess ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-slate"
                  render={<Link href="/dashboard/scores" />}
                >
                  Full history
                </Button>
              ) : null
            }
          >
            {props.hasAccess ? (
              <ScoresPanel initialScores={props.scores} variant="dashboard" />
            ) : (
              <DashboardEmptyState
                icon={Sparkles}
                title="Scores unlock with membership"
                description="Subscribe to log your latest five Stableford rounds and enter monthly draws."
                action={
                  <Button size="sm" render={<Link href="/subscribe" />}>
                    Subscribe
                  </Button>
                }
              />
            )}
          </BentoCard>
        </RevealStaggerItem>

        <RevealStaggerItem fast className="min-w-0 md:col-span-12 lg:col-span-6">
          <DashboardCharityCard
            charity={props.charity}
            plan={props.plan}
            hasAccess={props.hasAccess}
          />
        </RevealStaggerItem>

        <RevealStaggerItem fast className="min-w-0 md:col-span-6 lg:col-span-3">
          <BentoCard title="Draw participation" icon={CalendarDays}>
            {props.participation.drawsEntered === 0 &&
            !props.participation.upcomingDrawMonth ? (
              <DashboardEmptyState
                icon={CalendarDays}
                title="No draws yet"
                description="When you're entered in a monthly draw, you'll see your history and the next draw date here."
                className="py-8"
              />
            ) : (
              <div className="space-y-4">
                <AnimatedCount
                  value={props.participation.drawsEntered}
                  label="Draws entered"
                />
                {props.participation.upcomingDrawMonth ? (
                  <div className="rounded-xl border border-line bg-sand/40 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <p className="text-xs uppercase tracking-wide text-slate">
                      Upcoming draw
                    </p>
                    <p className="mt-1 font-sans text-lg text-navy">
                      {props.participation.upcomingDrawMonth}
                    </p>
                    {props.participation.upcomingDrawStatus ? (
                      <DrawStatusSteps
                        status={props.participation.upcomingDrawStatus}
                        className="mt-2 flex-wrap"
                      />
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No upcoming draw scheduled — check back soon.
                  </p>
                )}
              </div>
            )}
          </BentoCard>
        </RevealStaggerItem>

        <RevealStaggerItem fast className="min-w-0 md:col-span-6 lg:col-span-3">
          <BentoCard
            title="Winnings"
            icon={Trophy}
            headerAction={
              props.winnings.winCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-slate"
                  render={<Link href="/dashboard/prizes" />}
                >
                  Claims
                </Button>
              ) : null
            }
          >
            {props.winnings.winCount === 0 ? (
              <DashboardEmptyState
                icon={Trophy}
                title="No wins yet"
                description="When you match enough numbers in a draw, your prizes and payment status show up here."
                className="py-8"
              />
            ) : (
              <AnimatedWinnings totalWon={props.winnings.totalWon} winCount={props.winnings.winCount} paymentPill={props.winnings.paymentPill} />
            )}
          </BentoCard>
        </RevealStaggerItem>
      </RevealStagger>
    </div>
  );
}

function AnimatedCount({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { text } = useCountUp(countRef, value, {
    enabled: inView,
    duration: 900,
    format: (current) => String(Math.round(current)),
  });

  return (
    <div ref={ref}>
      <p className={tabularImpact}>
        <span ref={countRef} className="font-sans text-3xl text-coral">
          {text}
        </span>
      </p>
      <p className="text-sm text-slate">{label}</p>
    </div>
  );
}

function AnimatedWinnings({ totalWon, winCount, paymentPill }: { totalWon: number; winCount: number; paymentPill: string }) {
  return (
    <div className="space-y-4">
      <div>
        <p className={tabularImpact}>
          <CountUpCurrency
            value={totalWon}
            duration={1000}
            className="font-sans text-3xl text-navy"
          />
        </p>
        <p className="text-sm text-slate">
          Total won · {winCount} {winCount === 1 ? "prize" : "prizes"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Wallet className="size-4 text-slate" aria-hidden />
        <StatusPill value={paymentPill} />
      </div>
    </div>
  );
}

const MEMBER_BENEFITS = [
  "Entry into every monthly prize draw",
  "Your latest five Stableford scores tracked",
  "10%+ of each payment to your charity",
];

function BenefitList() {
  return (
    <ul className="space-y-1.5 text-sm text-slate">
      {MEMBER_BENEFITS.map((benefit) => (
        <li key={benefit} className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-status-active" aria-hidden />
          {benefit}
        </li>
      ))}
    </ul>
  );
}

/** Active: plan, price, renewal and billing. Inactive: plans, prices and a CTA. */
function SubscriptionSummary({
  hasAccess,
  plan,
  email,
  renewalDate,
  cancelAtPeriodEnd,
  hasBillingSubscription,
  prices,
}: {
  hasAccess: boolean;
  plan: SubscriptionPlan | null;
  email: string;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  hasBillingSubscription: boolean;
  prices: PlanPriceDisplay;
}) {
  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <ul className="divide-y divide-line rounded-xl border border-line">
          <li className="flex items-baseline justify-between gap-3 px-3 py-2.5">
            <span className="text-sm text-slate">Monthly</span>
            <span className={cn("font-sans text-navy", tabularImpact)}>
              {prices.monthlyLabel}
            </span>
          </li>
          <li className="px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-slate">Yearly</span>
              <span className={cn("font-sans text-navy", tabularImpact)}>
                {prices.yearlyLabel}
              </span>
            </div>
            {prices.yearlySavingsHint ? (
              <p className={cn("mt-0.5 text-xs text-status-active", tabularImpact)}>
                {prices.yearlySavingsHint}
              </p>
            ) : null}
          </li>
        </ul>
        <BenefitList />
        <Button size="lg" className="w-full" render={<Link href="/subscribe" />}>
          Subscribe now
        </Button>
      </div>
    );
  }

  const planPrice =
    plan === "yearly" ? prices.yearlyLabel : plan === "monthly" ? prices.monthlyLabel : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {plan ? (
            <Badge variant="outline" className="capitalize">
              {plan} plan
            </Badge>
          ) : null}
          {planPrice ? (
            <span className={cn("text-sm text-navy", tabularImpact)}>{planPrice}</span>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{email}</p>
      </div>
      {renewalDate ? (
        <p className={tabularImpact}>
          <span className="text-slate">
            {cancelAtPeriodEnd ? "Access until " : "Renews "}
          </span>
          <span className="text-navy">
            {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
              new Date(`${renewalDate}T12:00:00`),
            )}
          </span>
        </p>
      ) : null}
      <BenefitList />
      <BillingManageButtons
        showManage={hasBillingSubscription}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
      />
    </div>
  );
}
