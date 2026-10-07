const NAVY_SURFACE_PATHS = new Set([
  "/",
  "/subscribe",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

/** Stepped-edge band color on route enter (matches the page’s top surface). */
export function pageOpenEdgeColor(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  if (NAVY_SURFACE_PATHS.has(path)) {
    return "var(--navy)";
  }
  return "var(--cream)";
}

export function pageOpenEdgeInsetClass(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    return "top-0";
  }
  return "top-[var(--header-height)]";
}
