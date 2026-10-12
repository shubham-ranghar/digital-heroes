import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { requireAdmin } from "@/lib/auth/session";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Admin · Settings",
};

export const instant = false;

export default async function AdminSettingsPage() {
  await connection();
  const { supabase, user } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Settings</em>}
          description="Manage your admin profile and password."
        />
      </Reveal>
      <AdminSettingsForm
        email={user.email ?? ""}
        displayName={profile?.display_name ?? null}
      />
    </div>
  );
}
