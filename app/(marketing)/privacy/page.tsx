import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";

const LAST_UPDATED = "7 October 2026";

export const instant = false;

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How digital.HEROES collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <LegalDocument title="Privacy policy" lastUpdated={LAST_UPDATED}>
            <section>
              <h2>Data we collect</h2>
              <ul>
                <li>Account: email, display name, authentication identifiers (Supabase Auth).</li>
                <li>Gameplay: Stableford scores, draw entries, and winner verification uploads.</li>
                <li>Preferences: charity selection and contribution percentage.</li>
                <li>Billing: subscription status and Razorpay customer references (card data stays with Razorpay).</li>
                <li>Support: messages you send via the contact form.</li>
              </ul>
            </section>
            <section>
              <h2>How we use data</h2>
              <p>
                We run the subscription, calculate draw entries, route charity
                allocations, verify winners, provide support, and improve the product.
                Draw publication uses privacy-safe winner names on the public Winners page.
              </p>
            </section>
            <section>
              <h2>Processors</h2>
              <p>
                We use Supabase (database, authentication, storage) and Razorpay
                (payments). Each processor acts under its own terms and security
                certifications.
              </p>
            </section>
            <section>
              <h2>Cookies</h2>
              <p>
                Session cookies keep you signed in. Analytics cookies are minimal;
                we do not sell personal data to advertisers.
              </p>
            </section>
            <section>
              <h2>Retention</h2>
              <p>
                We keep account data while you remain a member and for a reasonable
                period afterward for legal, tax, and fraud-prevention purposes.
                You may request deletion via Settings; we process requests manually.
              </p>
            </section>
            <section>
              <h2>Your rights</h2>
              <p>
                Depending on your location you may access, correct, export, or delete
                personal data. Contact us to exercise these rights.
              </p>
            </section>
            <section>
              <h2>Contact</h2>
              <p>
                Privacy questions:{" "}
                <a href="/contact" className="text-foreground underline">
                  contact page
                </a>
                .
              </p>
            </section>
          </LegalDocument>
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
