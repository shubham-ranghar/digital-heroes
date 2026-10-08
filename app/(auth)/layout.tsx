import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";

/** Auth routes: header only; no footer. */
export default function AuthLayout({
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
