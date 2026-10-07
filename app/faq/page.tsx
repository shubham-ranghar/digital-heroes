import type { Metadata } from "next";

import { FaqAccordion } from "@/components/faq/faq-accordion";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { SectionHeading } from "@/components/ui/section-heading";
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
        <SectionHeading
          eyebrow="Help"
          title="Frequently asked questions"
          description="Everything you need to know about playing fairly, giving back, and getting paid if you win."
        />
        <div className="mt-10 max-w-3xl">
          <FaqAccordion items={faqItems} />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
