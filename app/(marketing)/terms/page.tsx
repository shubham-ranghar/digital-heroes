import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";

const LAST_UPDATED = "7 October 2026";

export const instant = false;

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms for digital.HEROES subscriptions, prize draws, and charity contributions.",
};

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <MarketingSection fade={false} variant="cream" className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <LegalDocument title="Terms of service" lastUpdated={LAST_UPDATED}>
            <section>
              <h2>1. Who we are</h2>
              <p>
                digital.HEROES operates a subscription platform that combines golf
                score tracking, monthly prize draws, and charitable giving. By creating
                an account or subscribing, you agree to these terms.
              </p>
            </section>
            <section>
              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old and legally able to enter a paid
                subscription and prize promotion in your country of residence. We may
                suspend accounts that provide false eligibility information.
              </p>
            </section>
            <section>
              <h2>3. Subscriptions & billing</h2>
              <ul>
                <li>Plans renew automatically until cancelled from your account settings.</li>
                <li>Prices are shown at checkout and may change for future periods with notice.</li>
                <li>Failed payments may pause draw entry until the subscription is active again.</li>
                <li>Refunds follow applicable consumer law; contact us if you believe a charge is incorrect.</li>
              </ul>
            </section>
            <section>
              <h2>4. Prize draws</h2>
              <ul>
                <li>Entries use your five latest Stableford scores saved in the dashboard.</li>
                <li>Draw rules, tier splits, and rollover are described on the How it works page.</li>
                <li>Winners must verify scorecard proof before prizes are marked paid.</li>
                <li>We may void entries that violate score integrity or duplicate accounts.</li>
              </ul>
            </section>
            <section>
              <h2>5. Charity contributions</h2>
              <p>
                You choose a partner charity and a minimum 10% share of each billing
                cycle. Allocations are processed according to your settings; partner
                availability may change over time.
              </p>
            </section>
            <section>
              <h2>6. Acceptable use</h2>
              <p>
                Do not attempt to manipulate draws, share accounts, upload fraudulent
                scorecards, or interfere with platform security. We may remove content
                and close accounts for abuse.
              </p>
            </section>
            <section>
              <h2>7. Liability</h2>
              <p>
                The service is provided as-is to the extent permitted by law. Our
                liability is limited to fees you paid in the twelve months before a
                claim, except where law requires otherwise.
              </p>
            </section>
            <section>
              <h2>8. Contact</h2>
              <p>
                Questions about these terms: use the{" "}
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
