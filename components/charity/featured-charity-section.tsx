import { FeaturedCharitySpotlight } from "@/components/charity/featured-charity-spotlight";
import { MarketingSection } from "@/components/layout/marketing-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedCharity } from "@/lib/charity/queries";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function FeaturedCharitySection() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const charity = await getFeaturedCharity(supabase);

  if (!charity) {
    return null;
  }

  return (
    <MarketingSection variant="navy" className="border-t border-line">
      <SectionHeading
        eyebrow="Spotlight"
        title="Featured charity"
        description="A partner cause we’re amplifying this season — chosen for measurable community impact."
        className="mb-8"
      />
      <FeaturedCharitySpotlight charity={charity} />
    </MarketingSection>
  );
}
