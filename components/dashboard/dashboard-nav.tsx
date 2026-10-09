"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";

import { ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { dashboardNavItems } from "@/lib/dashboard/nav";
import { layoutSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  const reduceMotion = useReducedMotion();
  const indicatorTransition = reduceMotion ? { duration: 0 } : layoutSpring;

  if (variant === "mobile") {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_24px_-16px_rgba(20,33,61,0.18)] backdrop-blur-md md:hidden"
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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "motion-interactive motion-press relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs",
                    active ? "text-coral" : "text-slate hover:text-navy",
                  )}
                >
                  {active ? (
                    <m.span
                      layoutId="dashboard-mobile-indicator"
                      transition={indicatorTransition}
                      className="absolute inset-x-3 -top-2 h-0.5 rounded-full bg-coral"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      "size-5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      active && "-translate-y-px",
                    )}
                    aria-hidden
                  />
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
          className="font-sans text-sm font-semibold tracking-tight text-navy motion-interactive hover:opacity-80"
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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group/nav motion-interactive relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                  active
                    ? "text-navy"
                    : "text-slate hover:bg-sand/60 hover:text-navy",
                )}
              >
                {active ? (
                  <m.span
                    layoutId="dashboard-sidebar-indicator"
                    transition={indicatorTransition}
                    className="absolute inset-0 rounded-xl bg-coral/15"
                    aria-hidden
                  >
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-coral" />
                  </m.span>
                ) : null}
                <Icon
                  className={cn(
                    "relative size-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/nav:translate-x-0.5 motion-reduce:transform-none",
                    active && "text-coral",
                  )}
                  aria-hidden
                />
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          );
        })}
        {/* Admin is navigation, not an action — it sits in the nav list. */}
        {isAdmin ? (
          <li>
            <Link
              href="/admin"
              className="group/nav motion-interactive relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate hover:bg-sand/60 hover:text-navy"
            >
              <ShieldCheck
                className="relative size-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/nav:translate-x-0.5 motion-reduce:transform-none"
                aria-hidden
              />
              <span className="relative">Admin</span>
            </Link>
          </li>
        ) : null}
      </ul>
      <div className="border-t border-line p-4">
        <SignOutButton
          variant="ghost"
          size="sm"
          withIcon
          className="w-full justify-start gap-3 px-3 text-slate hover:text-navy"
        />
      </div>
    </aside>
  );
}
