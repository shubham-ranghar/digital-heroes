/**
 * Absolute origin for links that leave the app (auth emails, payment returns).
 * Falls back to Vercel's own production domain so a missing
 * NEXT_PUBLIC_SITE_URL never sends live users to localhost.
 */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost}`;
  }
  return "http://localhost:3000";
}
