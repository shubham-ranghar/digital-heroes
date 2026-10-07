import Link from "next/link";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { getAdminOverviewStats } from "@/lib/admin/overview";
import { adminNavItems } from "@/lib/admin/nav";
import { requireAdmin } from "@/lib/auth/session";
import { tabularImpact } from "@/lib/typography";

export const instant = false;

export default async function AdminIndexPage() {
  await connection();
  await requireAdmin();

  let stats = null;
  try {
    stats = await getAdminOverviewStats();
  } catch {
    stats = null;
  }

  const cards = stats
    ? [
        { label: "Total users", value: stats.totalUsers },
        { label: "Active subscribers", value: stats.activeSubscribers },
        {
          label: "Current prize pool",
          value: `£${stats.currentPrizePool.toFixed(2)}`,
        },
        { label: "Next draw status", value: stats.nextDrawStatus },
        {
          label: "Pending verifications",
          value: stats.pendingWinnerVerifications,
        },
        {
          label: "Unread messages",
          value: stats.unreadContactMessages,
        },
      ]
    : [];

  return (
    <div className="space-y-10">
      <AdminSection
        title="Overview"
        description="Key metrics and shortcuts for platform operations."
      />
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[20px] border border-line bg-surface p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p className={tabularImpact + " mt-2 text-2xl font-semibold text-navy"}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Overview metrics require SUPABASE_SERVICE_ROLE_KEY.
        </p>
      )}

      <div>
        <h2 className="font-sans text-lg font-semibold text-navy">Quick links</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-navy hover:border-coral/40"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/admin/messages"
              className="block rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-navy hover:border-coral/40"
            >
              Contact messages
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
