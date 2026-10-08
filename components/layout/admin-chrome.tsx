"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminNavItems } from "@/lib/admin/nav";
import { layoutSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Overview is exact-match so it isn't highlighted on every /admin/* page. */
function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminChromeProps = {
  children: React.ReactNode;
  adminEmail?: string | null;
  showServiceRoleWarning?: boolean;
};

export function AdminChrome({
  children,
  adminEmail,
  showServiceRoleWarning,
}: AdminChromeProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const indicatorTransition = reduceMotion ? { duration: 0 } : layoutSpring;

  return (
    <div className="shell-dashboard min-h-screen lg:flex">
      <aside
        className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-svh lg:max-h-svh"
        aria-label="Admin"
      >
        <div className="border-b border-line px-5 py-6">
          <Link
            href="/dashboard"
            className="motion-link-arrow text-xs text-slate motion-interactive hover:text-navy"
          >
            ← Member dashboard
          </Link>
          <p className="mt-3 font-sans text-lg text-navy">Admin console</p>
          {adminEmail ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{adminEmail}</p>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {adminNavItems.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group/nav motion-interactive relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm",
                  active
                    ? "text-navy"
                    : "text-slate hover:bg-sand/60 hover:text-navy",
                )}
              >
                {active ? (
                  <m.span
                    layoutId="admin-sidebar-indicator"
                    transition={indicatorTransition}
                    className="absolute inset-0 rounded-xl bg-sand"
                    aria-hidden
                  >
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-coral" />
                  </m.span>
                ) : null}
                <Icon
                  className={cn(
                    "relative size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/nav:translate-x-0.5 motion-reduce:transform-none",
                    active && "text-coral",
                  )}
                  aria-hidden
                />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <SignOutButton className="w-full" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <p className="font-sans text-sm text-navy">Admin</p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="motion-link-arrow text-xs text-slate motion-interactive hover:text-navy"
            >
              ← Dashboard
            </Link>
            <SignOutButton className="min-w-[5.5rem]" />
          </div>
        </header>
        <nav
          className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden"
          aria-label="Admin sections"
        >
          {adminNavItems.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "motion-interactive motion-press relative inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-xs",
                  active ? "text-navy" : "text-slate hover:bg-sand/50 hover:text-navy",
                )}
              >
                {active ? (
                  <m.span
                    layoutId="admin-tabs-indicator"
                    transition={indicatorTransition}
                    className="absolute inset-0 rounded-full bg-sand"
                    aria-hidden
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div id="admin-content" data-route-content className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {showServiceRoleWarning ? (
            <p className="motion-fade-down mb-6 rounded-xl border border-line bg-sand px-4 py-3 text-sm text-navy">
              Set <code className="font-medium">SUPABASE_SERVICE_ROLE_KEY</code> for
              full admin data (users, draws, charities, reports). Winner actions
              still work via your admin session.
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
