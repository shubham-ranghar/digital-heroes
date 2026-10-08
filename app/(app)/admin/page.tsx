import Link from "next/link";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { getAdminOverviewStats } from "@/lib/admin/overview";
import { adminNavItems } from "@/lib/admin/nav";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/money";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { EmptyPageState } from "@/components/ui/page-state";
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
          label: "Estimated prize pool (active subscribers × fee)",
          value: formatCurrency(stats.currentPrizePool),
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
      <Reveal>
        <AdminSection
          title="Overview"
          description="Platform metrics at a glance."
        />
      </Reveal>
      {stats ? (
        <RevealStagger as="div" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <RevealStaggerItem key={card.label} as="div">
              <div className="rounded-[20px] border border-line bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className={tabularImpact + " mt-2 text-2xl font-semibold text-navy"}>
                  {card.value}
                </p>
              </div>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      ) : (
        <Reveal>
          <EmptyPageState
            title="Admin metrics unavailable"
            description="Overview metrics require SUPABASE_SERVICE_ROLE_KEY. Confirm your service role key and database connection."
          />
        </Reveal>
      )}

      <Reveal>
        <div>
          <h2 className="font-sans text-lg font-semibold text-navy">Quick links</h2>
          <RevealStagger as="ul" className="mt-4 grid gap-2 sm:grid-cols-2">
            {adminNavItems.map((item) => (
              <RevealStaggerItem key={item.href} as="li">
                <Link
                  href={item.href}
                  className="block rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-navy hover:border-coral/40 transition-colors"
                >
                  {item.label}
                </Link>
              </RevealStaggerItem>
            ))}
            <RevealStaggerItem as="li">
              <Link
                href="/admin/messages"
                className="block rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-navy hover:border-coral/40 transition-colors"
              >
                Contact messages
              </Link>
            </RevealStaggerItem>
          </RevealStagger>
        </div>
      </Reveal>
    </div>
  );
}
