import type { Metadata } from "next";
import { connection } from "next/server";

import { ContactForm } from "@/components/contact/contact-form";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { ConfigMissingState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the digital.HEROES team.",
};

export const instant = false;

export default async function ContactPage() {
  await connection();

  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Support"
            title="Get in touch"
            description="Questions about your account, a draw, or your charity? We're here to help."
          />
        </Reveal>
        <Reveal>
          <div className="mt-10 max-w-lg">
            {hasSupabaseEnv() ? (
              <ContactForm />
            ) : (
              <ConfigMissingState missing={["supabase"]} />
            )}
          </div>
        </Reveal>
      </MarketingSection>
    </MarketingPageShell>
  );
}
