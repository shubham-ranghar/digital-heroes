import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminCharitiesPanel } from "@/components/admin/admin-charities-panel";
import { AdminSection } from "@/components/admin/admin-section";
import { listAdminCharities } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Admin · Charities",
};

export const instant = false;

export default async function AdminCharitiesPage() {
  await connection();
  const charities = await listAdminCharities();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSection
        title="Charities"
        description="Add, edit, or remove partner causes and manage image URLs for marketing."
      />
      <AdminCharitiesPanel charities={charities} />
    </div>
  );
}
