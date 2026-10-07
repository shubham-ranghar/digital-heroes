"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminNavItems } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

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

  return (
    <div className="shell-dashboard min-h-screen lg:flex">
      <aside
        className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex"
        aria-label="Admin"
      >
        <div className="border-b border-line px-5 py-6">
          <Link
            href="/dashboard"
            className="text-xs text-slate hover:text-navy"
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
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sand text-navy"
                    : "text-slate hover:bg-sand/60 hover:text-navy",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
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
          <SignOutButton />
        </header>
        <nav
          className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden"
          aria-label="Admin sections"
        >
          {adminNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs",
                  active
                    ? "bg-sand text-navy"
                    : "text-slate hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {showServiceRoleWarning ? (
            <p className="mb-6 rounded-xl border border-line bg-sand px-4 py-3 text-sm text-navy">
              Set <code className="font-medium">SUPABASE_SERVICE_ROLE_KEY</code> for
              full admin data (users, draws, charities, reports). Winner actions
              still work via your admin session.
            </p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
