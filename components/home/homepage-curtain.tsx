"use client";

import { Suspense, type ReactNode } from "react";

import { FeaturedCharitySkeleton } from "@/components/charity/featured-charity-skeleton";
import { EditorialFinalCta } from "@/components/home/editorial-final-cta";
import { EditorialHowItWorks } from "@/components/home/editorial-how-it-works";
import { EditorialHowYouWin } from "@/components/home/editorial-how-you-win";
import { EditorialPricing } from "@/components/home/editorial-pricing";
import { StatementSection } from "@/components/home/statement-section";
import { CurtainSection, CurtainStack } from "@/components/motion/curtain-section";

type HomepageCurtainProps = {
  charitySlot: ReactNode;
};

export function HomepageCurtain({ charitySlot }: HomepageCurtainProps) {
  // Hero above is navy; each seam's band shows the section it leaves.
  // Three pins, chosen for narrative weight: the mission statement (first
  // beat after the hero), how you win (the prize hook that sets up the
  // charity), and the charity spotlight (the emotional core). How-it-works,
  // pricing and the final CTA are read or acted on, so they flow normally.
  return (
    <CurtainStack baseZIndex={10} leadColor="var(--navy)">
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream" pin>
        <StatementSection />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy">
        <EditorialHowItWorks />
      </CurtainSection>
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream" pin>
        <EditorialHowYouWin />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy" pin>
        {charitySlot}
      </CurtainSection>
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream">
        <EditorialPricing />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy">
        <EditorialFinalCta />
      </CurtainSection>
    </CurtainStack>
  );
}

export function HomepageCharitySlot({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FeaturedCharitySkeleton />}>
      <div className="motion-crossfade">{children}</div>
    </Suspense>
  );
}
