import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminCharitiesPanel } from "@/components/admin/admin-charities-panel";
import { AdminSection } from "@/components/admin/admin-section";
import { listAdminCharities } from "@/lib/admin/queries";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Charities",
};

export const instant = false;

export default async function AdminCharitiesPage() {
  await connection();
  const charities = await listAdminCharities();

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Charities</em>}
          description="Add, edit, or remove partner causes and manage image URLs for marketing."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
        <AdminCharitiesPanel charities={charities} />
      </Reveal>
    </div>
  );
}
