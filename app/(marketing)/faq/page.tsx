import type { Metadata } from "next";

import { FaqAccordion } from "@/components/faq/faq-accordion";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { faqItems } from "@/lib/faq/content";

export const instant = false;

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about subscriptions, scores, draws, charities, and payouts.",
};

export default function FaqPage() {
  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Help"
            title="Frequently asked questions"
            description="Answers about subscriptions, scores, draws, charities, and payouts."
          />
        </Reveal>
        <Reveal>
          <div className="mt-10 max-w-3xl">
            <FaqAccordion items={faqItems} />
          </div>
        </Reveal>
      </MarketingSection>
    </MarketingPageShell>
  );
}
