import Link from "next/link";

import { MarketingSection } from "@/components/layout/marketing-section";
import { RevealItem, ScrollReveal } from "@/components/home/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";
import { formatMoney } from "@/lib/money";
import {
  getMonthlySubscriptionFeeInr,
  getSubscriptionFeePaise,
} from "@/lib/subscription/fees";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const monthlyInr = getMonthlySubscriptionFeeInr();
  const yearlyPaise = getSubscriptionFeePaise("yearly");
  const monthlyCharityMin = formatMoney(
    Math.round(monthlyInr * 100 * (MIN_CHARITY_PERCENTAGE / 100)),
  );
  const yearlyCharityMin = formatMoney(
    Math.round(yearlyPaise * (MIN_CHARITY_PERCENTAGE / 100)),
  );

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: formatMoney(monthlyInr * 100),
      cadence: "per month",
      charity: `${monthlyCharityMin}+ to your cause`,
      highlight: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: formatMoney(yearlyPaise),
      cadence: "per year",
      charity: `${yearlyCharityMin}+ to your cause`,
      highlight: true,
    },
  ];

  return (
    <MarketingSection variant="navy" id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Membership that gives back"
        description={`Every plan includes score tracking, monthly draws, and at least ${MIN_CHARITY_PERCENTAGE}% of your fee to charity — increase your share anytime in the dashboard.`}
        className="mb-10"
      />
      <ScrollReveal stagger className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <RevealItem key={plan.id}>
            <div
              className={cn(
                "flex h-full flex-col rounded-[20px] border p-6",
                plan.highlight
                  ? "border-coral/45 bg-surface/80"
                  : "border-line bg-surface/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-sans text-xl text-cream">{plan.name}</h3>
                {plan.highlight ? <Badge>Best value</Badge> : null}
              </div>
              <p className={cn("mt-4 font-sans text-4xl text-coral", tabularImpact)}>
                {plan.price}
              </p>
              <p className="text-sm text-slate">{plan.cadence}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Charity share (min. {MIN_CHARITY_PERCENTAGE}%):{" "}
                <span className="text-status-active">{plan.charity}</span>
              </p>
              <Button
                className="mt-6 w-full"
                variant={plan.highlight ? "default" : "secondary"}
                render={<Link href="/subscribe" />}
              >
                Subscribe
              </Button>
            </div>
          </RevealItem>
        ))}
      </ScrollReveal>
    </MarketingSection>
  );
}
