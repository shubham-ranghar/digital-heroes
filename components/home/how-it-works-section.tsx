import { CreditCard, ListOrdered, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MarketingSection } from "@/components/layout/marketing-section";
import { RevealItem, ScrollReveal } from "@/components/home/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const steps: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: CreditCard,
    title: "Subscribe",
    description:
      "Pick monthly or yearly billing. At least 10% of your fee goes to the charity you select — you can increase that anytime.",
  },
  {
    icon: ListOrdered,
    title: "Enter your last 5 scores",
    description:
      "Log one Stableford score per day. We keep your latest five rounds — that snapshot powers your monthly draw entry.",
  },
  {
    icon: HeartHandshake,
    title: "Draw + impact",
    description:
      "You’re entered in the monthly prize draw while your chosen cause receives ongoing funding from your membership.",
  },
];

export function HowItWorksSection() {
  return (
    <MarketingSection variant="cream" id="how-it-works">
      <SectionHeading
        eyebrow="What you do"
        title="Simple rhythm, serious good"
        description="Three steps from signup to community prizes and charity funding — no gimmicks, no bright fairway greens."
        className="mb-10"
      />
      <ScrollReveal stagger className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <RevealItem key={step.title}>
              <div className="h-full rounded-[20px] border border-[var(--border)] bg-card p-6 shadow-sm">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-coral/15 text-coral">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-sans text-xl text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </RevealItem>
          );
        })}
      </ScrollReveal>
    </MarketingSection>
  );
}
