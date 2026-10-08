import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminDrawsPanel } from "@/components/admin/admin-draws-panel";
import { AdminSection } from "@/components/admin/admin-section";
import {
  getDrawSimulationPreview,
  listAdminDraws,
} from "@/lib/admin/queries";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Draws",
};

export const instant = false;

export default async function AdminDrawsPage({
  searchParams,
}: {
  searchParams: Promise<{ draw?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const draws = await listAdminDraws();
  const selectedDrawId = params.draw ?? draws[0]?.id ?? null;
  const preview =
    selectedDrawId ? await getDrawSimulationPreview(selectedDrawId) : null;

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Draws</em>}
          description="Choose random or algorithmic mode, simulate results, review the preview, then publish."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
        <AdminDrawsPanel
          draws={draws}
          selectedDrawId={selectedDrawId}
          preview={preview}
        />
      </Reveal>
    </div>
  );
}
