import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteFooterShell } from "@/components/layout/site-footer-shell";
import { SiteHeader } from "@/components/layout/site-header";

/** Marketing routes: header + footer. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        {children}
      </main>
      <Suspense fallback={null}>
        <SiteFooterShell>
          <SiteFooter />
        </SiteFooterShell>
      </Suspense>
    </>
  );
}
