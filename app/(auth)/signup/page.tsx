import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell, AuthSwitchLink } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { ConfigMissingState } from "@/components/ui/page-state";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Create account",
};

export const instant = false;

export default async function SignupPage() {
  await connection();
  await redirectIfAuthenticated();

  if (!hasSupabaseEnv()) {
    return (
      <AuthShell
        title="Join digital.HEROES"
        description="Create your account and choose a charity."
      >
        <ConfigMissingState missing={["supabase"]} />
      </AuthShell>
    );
  }

  let charities: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_featured: boolean;
  }[] = [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("charities")
    .select("id, name, slug, description, is_featured")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });
  charities = data ?? [];

  return (
    <AuthShell
      title="Join digital.HEROES"
      description="Create your account, choose a charity, and set how much of your subscription supports their work."
      footer={
        <AuthSwitchLink
          prompt="Already have an account?"
          href="/login"
          label="Sign in"
        />
      }
    >
      <SignupForm charities={charities} />
    </AuthShell>
  );
}
