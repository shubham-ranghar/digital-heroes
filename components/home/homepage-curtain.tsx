"use client";

import { Suspense, type ReactNode } from "react";

import { FeaturedCharitySkeleton } from "@/components/charity/featured-charity-skeleton";
import { EditorialFinalCta } from "@/components/home/editorial-final-cta";
import { EditorialHowItWorks } from "@/components/home/editorial-how-it-works";
import { EditorialHowYouWin } from "@/components/home/editorial-how-you-win";
import { EditorialPricing } from "@/components/home/editorial-pricing";
import { HumanMoment } from "@/components/home/human-moment";
import { StatementSection } from "@/components/home/statement-section";
import { CurtainSection, CurtainStack } from "@/components/motion/curtain-section";

type HomepageCurtainProps = {
  charitySlot: ReactNode;
  /** Cumulative raised (₹) for the pricing impact line and the closing CTA. */
  totalRaised: number | null;
};

export function HomepageCurtain({ charitySlot, totalRaised }: HomepageCurtainProps) {
  // Hero above is navy. Stepped edges are rationed to two seams here (the
  // footer silhouette is the page's third): a standard one leaving the hero,
  // and one dramatic edge into the charities, the emotional core. Every other
  // seam is flat. After the charities' density comes the human moment: a
  // full-bleed photo with no edge, sliding over them. Pins: the statement and
  // the charities; how you win flows so the dramatic seam rises out of an
  // undimmed cream band.
  return (
    <CurtainStack baseZIndex={10} leadColor="var(--navy)">
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream" pin>
        <StatementSection />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy" edge="none">
        <EditorialHowItWorks />
      </CurtainSection>
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream" edge="none">
        <EditorialHowYouWin />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy" edge="dramatic" pin>
        {charitySlot}
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy" edge="none">
        <HumanMoment />
      </CurtainSection>
      <CurtainSection tone="cream" edgeColor="var(--cream)" surfaceClassName="bg-cream" edge="none">
        <EditorialPricing totalRaised={totalRaised} />
      </CurtainSection>
      <CurtainSection tone="navy" edgeColor="var(--navy)" surfaceClassName="bg-navy" edge="none">
        <EditorialFinalCta totalRaised={totalRaised} />
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
