import { connection } from "next/server";

import { FooterLinkGrid } from "@/components/layout/footer-link-grid";
import { FooterSteppedBrand } from "@/components/layout/footer-stepped-brand";
import {
  buildFooterColumns,
  getFooterContactBlock,
} from "@/lib/footer-links";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function SiteFooter() {
  await connection();

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

  const columns = buildFooterColumns(isLoggedIn);
  const contact = getFooterContactBlock();
  const year = new Date().getFullYear();

  return (
    <footer
      data-nav-theme="light"
      className="relative overflow-x-clip border-t border-line"
    >
      <FooterLinkGrid columns={columns} />
      <FooterSteppedBrand contact={contact} year={year} />
    </footer>
  );
}
