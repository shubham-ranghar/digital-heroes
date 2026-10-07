import type { ReactNode } from "react";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardChromeProps = {
  children: ReactNode;
  isAdmin?: boolean;
  className?: string;
};

export function DashboardChrome({
  children,
  isAdmin,
  className,
}: DashboardChromeProps) {
  return (
    <div className={cn("shell-dashboard min-h-screen md:flex", className)}>
      <DashboardNav variant="sidebar" isAdmin={isAdmin} />
      <div className="flex min-h-screen flex-1 flex-col pb-24 md:pb-10">
        <header
          className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 md:hidden"
        >
          <Link
            href="/dashboard"
            className="font-sans text-sm font-semibold tracking-tight text-navy"
          >
            Member hub
          </Link>
          <SignOutButton />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 md:px-10">{children}</main>
      </div>
      <DashboardNav variant="mobile" isAdmin={isAdmin} />
    </div>
  );
}
