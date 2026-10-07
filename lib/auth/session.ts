import { redirect } from "next/navigation";

import type { ProfileRole } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

type RequireUserOptions = {
  /** Path passed to login as `next` (must start with /). */
  loginNext?: string;
};

/** Require an authenticated user (server-side; middleware is first line of defense). */
export async function requireUser(options?: RequireUserOptions) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const next = options?.loginNext;
    if (next?.startsWith("/")) {
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }
    redirect("/login");
  }

  return { supabase, user };
}

/** Require admin role; redirects subscribers to dashboard. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, role: profile.role as ProfileRole };
}

export { requireActiveSubscription, getSubscriptionAccess } from "@/lib/subscription/access";
