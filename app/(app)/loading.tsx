"use client";

import { usePathname } from "next/navigation";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while the member/admin layouts (which check auth on the server)
 * resolve. Without it nothing sits between those layouts and `(app)`, so a
 * navigation into them blocks on the server and the route wipe holds. Mirrors
 * each shell's frame (sidebar + content pane) so nothing shifts when the real
 * chrome streams in; the pane carries `data-route-content`, so `RouteWipe`
 * reveals just that pane, as it will on the real shell.
 */
export default function AppLoading() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <AdminShellSkeleton />;
  }
  if (pathname.startsWith("/dashboard")) {
    return <MemberShellSkeleton />;
  }
  return <div className="flex-1" aria-busy="true" />;
}

function SidebarSkeleton({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="space-y-2 px-5 py-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-1 px-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Frame of `DashboardChrome`. */
function MemberShellSkeleton() {
  return (
    <div className="shell-dashboard min-h-screen md:flex" aria-busy="true">
      <SidebarSkeleton className="hidden w-56 shrink-0 border-r border-line bg-surface md:sticky md:top-0 md:block md:h-svh" />
      <div className="flex min-h-screen flex-1 flex-col pb-24 md:pb-10">
        <div className="h-14 border-b border-line bg-surface md:hidden" />
        <div data-route-content className="flex-1 px-4 py-8 sm:px-6 md:px-10">
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Frame of `AdminChrome`. */
function AdminShellSkeleton() {
  return (
    <div className="shell-dashboard min-h-screen lg:flex" aria-busy="true">
      <SidebarSkeleton className="hidden w-60 shrink-0 border-r border-line bg-surface lg:sticky lg:top-0 lg:block lg:h-svh" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[6.5rem] border-b border-line bg-surface lg:hidden" />
        <div data-route-content className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
