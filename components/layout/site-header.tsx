import { connection } from "next/server";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { listCharities } from "@/lib/charity/queries";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function SiteHeader() {
  await connection();
  let menuCharities: { name: string; slug: string }[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const charities = await listCharities(supabase);
      menuCharities = charities.slice(0, 6).map((charity) => ({
        name: charity.name,
        slug: charity.slug,
      }));
    } catch {
      menuCharities = [];
    }
  }

  let isLoggedIn = false;
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isLoggedIn = Boolean(user);
    } catch {
      isLoggedIn = false;
    }
  }

  return (
    <SiteNavbar menuCharities={menuCharities} isLoggedIn={isLoggedIn} />
  );
}
