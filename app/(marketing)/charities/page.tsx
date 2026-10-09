import type { Metadata } from "next";
import { connection } from "next/server";

import { CharitiesDirectory } from "@/components/charity/charities-directory";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { ConfigMissingState, EmptyPageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { listCharities } from "@/lib/charity/queries";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Charities",
};

export const instant = false;

export default async function CharitiesPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <MarketingPageShell>
        <MarketingSection fade={false} variant="cream" className="py-12 sm:py-16">
          <ConfigMissingState missing={["supabase"]} />
        </MarketingSection>
      </MarketingPageShell>
    );
  }

  const supabase = await createClient();
  const charities = await listCharities(supabase);

  return (
    <MarketingPageShell>
      <MarketingSection fade={false} variant="cream" className="py-12 sm:py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Partners"
            title="Causes you can support"
            description="Every subscription shares a meaningful portion with these organizations. Browse, learn, and give directly."
            className="mb-10"
          />
        </Reveal>
        {charities.length === 0 ? (
          <Reveal>
            <EmptyPageState
              title="No charities yet"
              description="Partners are being onboarded. Check back soon or contact support if you expected causes to appear here."
            />
          </Reveal>
        ) : (
          <CharitiesDirectory charities={charities} />
        )}
      </MarketingSection>
    </MarketingPageShell>
  );
}
