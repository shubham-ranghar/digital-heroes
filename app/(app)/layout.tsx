import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";

/** App routes: header only; no footer. */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main data-route-content className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        {children}
      </main>
    </>
  );
}
