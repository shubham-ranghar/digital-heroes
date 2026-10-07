import type { Metadata } from "next";
import { connection } from "next/server";

import { CharitiesDirectory } from "@/components/charity/charities-directory";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { ConfigMissingState, EmptyPageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
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
        <MarketingSection variant="cream" className="py-12 sm:py-16">
          <ConfigMissingState missing={["supabase"]} />
        </MarketingSection>
      </MarketingPageShell>
    );
  }

  const supabase = await createClient();
  const charities = await listCharities(supabase);

  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <SectionHeading
          eyebrow="Partners"
          title="Causes you can support"
          description="Browse partner charities, see upcoming events, and give independently of your membership."
          className="mb-10"
        />
        {charities.length === 0 ? (
          <EmptyPageState
            title="No charities yet"
            description="Partners are being onboarded. Check back soon or contact support if you expected causes to appear here."
          />
        ) : (
          <CharitiesDirectory charities={charities} />
        )}
      </MarketingSection>
    </MarketingPageShell>
  );
}
