import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { WinnerProofUpload } from "@/components/winners/winner-proof-upload";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/session";
import { listWinnersForUser } from "@/lib/winners/queries";

export const metadata: Metadata = {
  title: "Prize claims",
};

export const instant = false;

export default async function PrizesPage() {
  await connection();
  const { supabase, user } = await requireUser();
  const winners = await listWinnersForUser(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SectionHeading
        eyebrow="Draws"
        title="Prize verification"
        description="Upload a screenshot as proof for each winning draw. Our team reviews verification only — payment is tracked separately."
        className="mb-10"
      />

      {winners.length === 0 ? (
        <DashboardEmptyState
          icon={Trophy}
          title="No prize claims yet"
          description="When you win a monthly draw, upload proof here and we'll review it before payment."
          action={
            <Button variant="secondary" size="sm" render={<Link href="/dashboard" />}>
              Back to overview
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {winners.map((winner) => (
            <WinnerProofUpload key={winner.id} winner={winner} />
          ))}
        </div>
      )}
    </div>
  );
}
