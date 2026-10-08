import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { listAdminUsers } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export const instant = false;

export default async function AdminUsersPage() {
  await connection();
  const users = await listAdminUsers();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSection
        title="Users"
        description="View and edit profiles, adjust subscriptions, and manage member scores."
      />
      <AdminUsersPanel users={users} />
    </div>
  );
}
