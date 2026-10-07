"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";

import { DashboardCharityCard } from "@/components/dashboard/dashboard-charity-card";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { BentoCard } from "@/components/dashboard/bento-card";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { ScoresPanel } from "@/components/scores/scores-panel";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  DashboardCharity,
  DashboardParticipation,
  DashboardWinnings,
} from "@/lib/dashboard/queries";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { ScoreRow } from "@/lib/scores/types";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";
import { tabularImpact } from "@/lib/typography";

export type DashboardHomeProps = {
  displayName: string | null;
  email: string;
  hasAccess: boolean;
  isAdmin: boolean;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | "none";
  renewalDate: string | null;
  charity: DashboardCharity;
  scores: ScoreRow[];
  participation: DashboardParticipation;
  winnings: DashboardWinnings;
};

function subscriptionStatusValue(
  hasAccess: boolean,
  status: SubscriptionStatus | "none",
): string {
  if (hasAccess) {
    return "active";
  }
  if (status === "lapsed") {
    return "lapsed";
  }
  return "inactive";
}

export function DashboardHome(props: DashboardHomeProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        variants: staggerContainer,
      };

  const title = props.displayName
    ? `Hello, ${props.displayName}`
    : "Your dashboard";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <motion.header
        className="mb-8"
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <p className="text-sm font-medium uppercase tracking-widest text-slate">
          Member
        </p>
        <h1 className="mt-2 font-sans text-3xl text-navy sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {props.hasAccess
            ? "Log scores, track draws, and grow your charity impact — all in one place."
            : "Your charity and winnings stay visible here. Subscribe to log scores and enter draws."}
        </p>
      </motion.header>

      <motion.div
        className="grid auto-rows-min gap-4 md:grid-cols-12"
        {...motionProps}
      >
        <motion.div className="md:col-span-4" variants={fadeUp}>
          <BentoCard title="Subscription">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  value={subscriptionStatusValue(props.hasAccess, props.status)}
                />
                {props.plan ? (
                  <Badge variant="outline" className="capitalize">
                    {props.plan}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{props.email}</p>
              {props.renewalDate ? (
                <p className={tabularImpact}>
                  <span className="text-slate">
                    {props.hasAccess ? "Renews " : "Access until "}
                  </span>
                  <span className="text-navy">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(`${props.renewalDate}T12:00:00`))}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Renewal date appears once billing is active.
                </p>
              )}
              {props.hasAccess ? (
                <CheckoutButtons showPortal />
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  render={<Link href="/subscribe" />}
                >
                  Subscribe now
                </Button>
              )}
            </div>
          </BentoCard>
        </motion.div>

        <motion.div className="md:col-span-8" variants={fadeUp}>
          <BentoCard
            title="Stableford scores"
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
        </motion.div>

        <motion.div className="md:col-span-6" variants={fadeUp}>
          <DashboardCharityCard
            charity={props.charity}
            plan={props.plan}
            hasAccess={props.hasAccess}
          />
        </motion.div>

        <motion.div className="md:col-span-3" variants={fadeUp}>
          <BentoCard title="Draw participation">
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
                <div>
                  <p className={tabularImpact}>
                    <span className="font-sans text-3xl text-coral">
                      {props.participation.drawsEntered}
                    </span>
                  </p>
                  <p className="text-sm text-slate">Draws entered</p>
                </div>
                {props.participation.upcomingDrawMonth ? (
                  <div className="rounded-xl border border-line bg-sand/40 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate">
                      Upcoming draw
                    </p>
                    <p className="mt-1 font-sans text-lg text-navy">
                      {props.participation.upcomingDrawMonth}
                    </p>
                    {props.participation.upcomingDrawStatus ? (
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        Status: {props.participation.upcomingDrawStatus}
                      </p>
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
        </motion.div>

        <motion.div className="md:col-span-3" variants={fadeUp}>
          <BentoCard
            title="Winnings"
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
              <div className="space-y-4">
                <div>
                  <p className={tabularImpact}>
                    <span className="font-sans text-3xl text-navy">
                      £{props.winnings.totalWon.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm text-slate">
                    Total won · {props.winnings.winCount}{" "}
                    {props.winnings.winCount === 1 ? "prize" : "prizes"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-slate" aria-hidden />
                  <StatusPill value={props.winnings.paymentPill} />
                </div>
              </div>
            )}
          </BentoCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
