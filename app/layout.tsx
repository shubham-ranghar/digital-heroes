import type { Metadata } from "next";
import { Suspense } from "react";
import { FontFamilyAudit } from "@/components/dev/font-family-audit";
import { austin, bagossStandard } from "@/lib/fonts";
import { AppMotionShell } from "@/components/providers/app-motion-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteFooterShell } from "@/components/layout/site-footer-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "digital.HEROES",
    template: "%s · digital.HEROES",
  },
  description:
    "Subscription platform combining score tracking, monthly prize draws, and charity giving.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bagossStandard.variable} ${austin.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col">
        <div className="grain-overlay" aria-hidden />
        <AppMotionShell>
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main className="flex flex-1 flex-col">{children}</main>
          <Suspense fallback={null}>
            <SiteFooterShell>
              <SiteFooter />
            </SiteFooterShell>
          </Suspense>
        </AppMotionShell>
        <Toaster position="top-center" richColors closeButton />
        {process.env.NODE_ENV === "development" ? <FontFamilyAudit /> : null}
      </body>
    </html>
  );
}
