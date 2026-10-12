import { connection } from "next/server";

import { EditorialCharitySpotlight } from "@/components/home/editorial-charity-spotlight";
import { EditorialHero } from "@/components/home/editorial-hero";
import {
  HomepageCharitySlot,
  HomepageCurtain,
} from "@/components/home/homepage-curtain";
import { EditorialMobileSubscribeBar } from "@/components/home/editorial-mobile-subscribe-bar";
import { getViewerIsAdmin } from "@/lib/auth/session";
import { getHomepageCharities } from "@/lib/home/charities";
import { getHomeStats } from "@/lib/home/stats";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const instant = false;

async function CharitySpotlightLoader({
  totalRaised,
}: {
  totalRaised: number | null;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <EditorialCharitySpotlight
        data={{ featured: null, others: [], featuredEvents: [] }}
        totalRaised={totalRaised}
      />
    );
  }

  const supabase = await createClient();
  const data = await getHomepageCharities(supabase);
  return <EditorialCharitySpotlight data={data} totalRaised={totalRaised} />;
}

export default async function Home() {
  await connection();
  const [stats, isAdmin] = await Promise.all([
    getHomeStats(),
    getViewerIsAdmin(),
  ]);

  return (
    <>
      <EditorialHero stats={stats} isAdmin={isAdmin} />
      <HomepageCurtain
        isAdmin={isAdmin}
        totalRaised={stats.totalRaisedDisplay}
        charitySlot={
          <HomepageCharitySlot>
            <CharitySpotlightLoader totalRaised={stats.totalRaisedDisplay} />
          </HomepageCharitySlot>
        }
      />
      {/* Admins don't subscribe, so they get no subscribe bar. */}
      {isAdmin ? null : (
        <>
          <EditorialMobileSubscribeBar />
          <div className="h-20 md:hidden" aria-hidden />
        </>
      )}
    </>
  );
}
