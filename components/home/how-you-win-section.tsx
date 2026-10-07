import { MarketingSection } from "@/components/layout/marketing-section";
import { RevealItem, ScrollReveal } from "@/components/home/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

const tiers = [
  {
    matches: 3,
    share: 25,
    label: "Community tier",
    highlight: false,
  },
  {
    matches: 4,
    share: 35,
    label: "Strong match",
    highlight: false,
  },
  {
    matches: 5,
    share: 40,
    label: "Jackpot tier",
    highlight: true,
    note: "Rolls over if unclaimed",
  },
];

export function HowYouWinSection() {
  return (
    <MarketingSection variant="navy" id="how-you-win">
      <SectionHeading
        eyebrow="How you win"
        title="Tiered monthly prizes"
        description="Match enough numbers from your five-score entry to share the pool. If several members hit the same tier, the prize splits equally."
        className="mb-10"
      />
      <ScrollReveal stagger className="grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <RevealItem key={tier.matches}>
            <div
              className={cn(
                "relative h-full overflow-hidden rounded-[20px] border p-6",
                tier.highlight
                  ? "border-coral/50 bg-surface/80 shadow-[0_0_40px_var(--glow-coral)]"
                  : "border-line bg-surface/50",
              )}
            >
              {tier.highlight ? (
                <div
                  className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-coral/25 blur-2xl"
                  aria-hidden
                />
              ) : null}
              <p className="text-xs uppercase tracking-widest text-slate">
                {tier.label}
              </p>
              <p className={cn("mt-3 font-sans text-4xl text-cream", tabularImpact)}>
                {tier.matches}-match
              </p>
              <p className={cn("mt-2 font-sans text-3xl text-coral", tabularImpact)}>
                {tier.share}%
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                of the draw prize pool for this tier
              </p>
              {tier.note ? (
                <p className="mt-4 text-xs font-medium text-status-active">{tier.note}</p>
              ) : null}
            </div>
          </RevealItem>
        ))}
      </ScrollReveal>
      <p className="mt-8 max-w-2xl text-sm text-slate">
        Prizes are shared equally among every winner at the same tier in a given
        month. Verification applies to winners only; charity giving is separate
        from prize payouts.
      </p>
    </MarketingSection>
  );
}
