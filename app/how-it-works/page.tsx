import type { Metadata } from "next";
import { connection } from "next/server";

import { PoolCalculator } from "@/components/how-it-works/pool-calculator";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { TIER_PERCENTAGES } from "@/lib/draw/constants";
import { getDrawFeeConfig } from "@/lib/draw/db";
import { getHomeStats } from "@/lib/home/stats";
import { formatCurrency } from "@/lib/money";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Subscribe, track five Stableford scores, and join the monthly digital.HEROES prize draw while supporting your charity.",
};

export const instant = false;

export default async function HowItWorksPage() {
  await connection();
  const feeConfig = getDrawFeeConfig();
  const stats = await getHomeStats();

  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <SectionHeading
          eyebrow="Platform"
          title="How digital.HEROES works"
          description="Three steps: subscribe, keep your latest five Stableford scores current, and enter the monthly draw. A share of every subscription supports the charity you pick."
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Subscribe",
              body:
                "Pick monthly or yearly billing. At least 10% of each cycle goes to your chosen charity automatically.",
            },
            {
              step: "2",
              title: "Enter five scores",
              body:
                "Log Stableford points from your rounds. We always use your five most recent scores for the draw entry.",
            },
            {
              step: "3",
              title: "Monthly draw",
              body:
                "Winning numbers are published after admin simulation and review. Match 3, 4, or 5 numbers to share tier prize pools.",
            },
          ].map((item) => (
            <li
              key={item.step}
              className="rounded-[20px] border border-line bg-surface p-6"
            >
              <p className="text-sm font-medium text-coral">Step {item.step}</p>
              <h2 className="mt-2 font-sans text-xl font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection variant="navy" id="how-you-win" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Prizes"
          title="How you win"
          description="Your five scores are compared to the published winning numbers. More matches mean a larger share of that month's prize pool."
        />
        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li>5 matches — top tier pool (40% of the prize fund, plus any jackpot rollover)</li>
          <li>4 matches — middle tier (35%)</li>
          <li>3 matches — entry tier (25%)</li>
          <li>Equal split among everyone who hits the same tier in that draw</li>
        </ul>
      </MarketingSection>

      <MarketingSection variant="cream" id="prize-pools" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Pools"
          title="Prize pools & rollover"
          description={`Each active subscriber contributes ${formatCurrency(feeConfig.feePerSubscriber)} toward the draw fund (${feeConfig.poolPercentage}% allocated to prizes). Tier split: ${TIER_PERCENTAGES[5] * 100}% / ${TIER_PERCENTAGES[4] * 100}% / ${TIER_PERCENTAGES[3] * 100}%. Unclaimed 5-match pools roll into the next jackpot.`}
        />
        <div className="mt-10">
          <PoolCalculator
            feePerSubscriber={feeConfig.feePerSubscriber}
            poolPercentage={feeConfig.poolPercentage}
            jackpotCarryover={stats.jackpotRollover}
          />
        </div>
      </MarketingSection>

      <MarketingSection variant="navy" id="draw-rules" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Rules"
          title="Draw rules"
          description="Transparent process from simulation to published results."
        />
        <ul className="mt-8 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
          <li>Five winning Stableford numbers (range 1–45) per published draw</li>
          <li>Random mode: numbers drawn independently. Algorithmic mode: derived from anonymised subscriber score data</li>
          <li>Monthly cadence aligned to calendar months</li>
          <li>Admins simulate outcomes, review winners, and publish when verified</li>
          <li>Winners upload scorecard proof; admins verify before payment is marked paid</li>
          <li>Published results appear on the public Winners page with privacy-safe names</li>
        </ul>
      </MarketingSection>
    </MarketingPageShell>
  );
}
