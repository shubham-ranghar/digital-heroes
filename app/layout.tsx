import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter_Tight, Instrument_Serif } from "next/font/google";

import { FontFamilyAudit } from "@/components/dev/font-family-audit";
import { AppMotionShell } from "@/components/providers/app-motion-shell";
import { SiteFooterShell } from "@/components/layout/site-footer-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

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
      className={`${interTight.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col">
        <div className="grain-overlay" aria-hidden />
        <AppMotionShell>
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooterShell />
        </AppMotionShell>
        <Toaster position="top-center" richColors closeButton />
        {process.env.NODE_ENV === "development" ? <FontFamilyAudit /> : null}
      </body>
    </html>
  );
}
