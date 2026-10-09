"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SiteFooterShellProps = {
  children: ReactNode;
};

const AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

/** Marketing pages that render without the site footer. */
const FOOTERLESS_PATHS = new Set([
  "/charities",
  "/how-it-works",
  "/winners",
  "/faq",
  "/contact",
]);

export function SiteFooterShell({ children }: SiteFooterShellProps) {
  const pathname = usePathname();
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    AUTH_PATHS.has(pathname) ||
    FOOTERLESS_PATHS.has(pathname)
  ) {
    return null;
  }
  return children;
}
