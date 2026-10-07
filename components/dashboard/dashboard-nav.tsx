"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { dashboardNavItems } from "@/lib/dashboard/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardNavProps = {
  isAdmin?: boolean;
  variant: "sidebar" | "mobile";
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export function DashboardNav({ isAdmin, variant }: DashboardNavProps) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface backdrop-blur-md md:hidden"
        aria-label="Dashboard"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {dashboardNavItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition-colors",
                    active
                      ? "text-coral"
                      : "text-slate hover:text-navy",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <aside
      className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface md:sticky md:top-0 md:flex md:h-svh md:max-h-svh"
      aria-label="Dashboard"
    >
      <div className="px-5 py-8">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-navy"
        >
          digital<span className="text-coral">.HEROES</span>
        </Link>
        <p className="mt-1 text-xs text-slate">Member hub</p>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-3">
        {dashboardNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-coral/15 text-navy"
                    : "text-slate hover:bg-cream/5 hover:text-navy",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 border-t border-line p-4">
        {isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            render={<Link href="/admin" />}
          >
            Admin
          </Button>
        ) : null}
        <SignOutButton className="w-full" />
      </div>
    </aside>
  );
}
