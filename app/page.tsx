import { connection } from "next/server";
import { Suspense } from "react";

import { FeaturedCharitySkeleton } from "@/components/charity/featured-charity-skeleton";
import { EditorialCharitySpotlight } from "@/components/home/editorial-charity-spotlight";
import { EditorialFinalCta } from "@/components/home/editorial-final-cta";
import { EditorialHero } from "@/components/home/editorial-hero";
import { EditorialHowItWorks } from "@/components/home/editorial-how-it-works";
import { EditorialHowYouWin } from "@/components/home/editorial-how-you-win";
import { EditorialMobileSubscribeBar } from "@/components/home/editorial-mobile-subscribe-bar";
import { EditorialPricing } from "@/components/home/editorial-pricing";
import { StatementSection } from "@/components/home/statement-section";
import { getHomepageCharities } from "@/lib/home/charities";
import { getHomeStats } from "@/lib/home/stats";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const instant = false;

async function CharitySpotlightLoader() {
  if (!hasSupabaseEnv()) {
    return (
      <EditorialCharitySpotlight
        data={{ featured: null, others: [], featuredEvents: [] }}
      />
    );
  }

  const supabase = await createClient();
  const data = await getHomepageCharities(supabase);
  return <EditorialCharitySpotlight data={data} />;
}

export default async function Home() {
  await connection();
  const stats = await getHomeStats();

  return (
    <>
      <EditorialHero stats={stats} />
      <StatementSection />
      <EditorialHowItWorks />
      <EditorialHowYouWin />
      <Suspense fallback={<FeaturedCharitySkeleton />}>
        <CharitySpotlightLoader />
      </Suspense>
      <EditorialPricing />
      <EditorialFinalCta />
      <EditorialMobileSubscribeBar />
      <div className="h-20 md:hidden" aria-hidden />
    </>
  );
}
