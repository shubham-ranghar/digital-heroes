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
  return (
    <CurtainStack baseZIndex={10}>
      <CurtainSection edgeColor="var(--cream)" surfaceClassName="bg-cream">
        <StatementSection />
      </CurtainSection>
      <CurtainSection edgeColor="var(--navy)" surfaceClassName="bg-navy">
        <EditorialHowItWorks />
      </CurtainSection>
      <CurtainSection edgeColor="var(--cream)" surfaceClassName="bg-cream">
        <EditorialHowYouWin />
      </CurtainSection>
      <CurtainSection edgeColor="var(--navy)" surfaceClassName="bg-navy">
        {charitySlot}
      </CurtainSection>
      <CurtainSection edgeColor="var(--cream)" surfaceClassName="bg-cream">
        <EditorialPricing />
      </CurtainSection>
      <CurtainSection
        edgeColor="var(--navy)"
        surfaceClassName="bg-navy"
        pin
      >
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
