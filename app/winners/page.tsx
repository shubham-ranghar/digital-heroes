import type { Metadata } from "next";
import { connection } from "next/server";

import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { EmptyPageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublicWinners } from "@/lib/winners/public-queries";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Winners",
  description: "Published monthly draw results and prize amounts.",
};

export const instant = false;

function formatDrawMonth(monthIso: string): string {
  const date = new Date(`${monthIso}T12:00:00.000Z`);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function WinnersPage() {
  await connection();
  const winners = await listPublicWinners();

  return (
    <MarketingPageShell>
      <MarketingSection variant="cream" className="py-12 sm:py-16">
        <SectionHeading
          eyebrow="Results"
          title="Published winners"
          description="Names are shown as first name and initial only. Full verification happens in the member dashboard before payouts."
        />

        {winners.length === 0 ? (
          <div className="mt-10">
            <EmptyPageState
              title="No published draws yet"
              description="When the first draw is published, winners will appear here with tier and prize amount."
            />
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-[20px] border border-line bg-surface">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Winner</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Prize</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {formatDrawMonth(row.drawMonth)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.displayName}</td>
                    <td className={tabularImpact + " px-4 py-3 text-foreground"}>
                      {row.tier}-match
                    </td>
                    <td className={tabularImpact + " px-4 py-3 text-foreground"}>
                      {formatCurrency(row.prizeAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MarketingSection>
    </MarketingPageShell>
  );
}
