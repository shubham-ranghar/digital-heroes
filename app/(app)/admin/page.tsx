import { connection } from "next/server";

import { AdminSection } from "@/components/admin/admin-section";
import { getAdminOverviewStats } from "@/lib/admin/overview";
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
        {
          label: "Current draw status",
          value:
            stats.nextDrawStatus.charAt(0).toUpperCase() +
            stats.nextDrawStatus.slice(1),
        },
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
      <Reveal trigger="mount" fast>
        <AdminSection
          title="Overview"
          description="Platform metrics at a glance."
        />
      </Reveal>
      {stats ? (
        <RevealStagger
          trigger="mount"
          stagger={0.06}
          as="div"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <RevealStaggerItem key={card.label} as="div" fast>
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
        <Reveal trigger="mount" fast>
          <EmptyPageState
            title="Admin metrics unavailable"
            description="Overview metrics require SUPABASE_SERVICE_ROLE_KEY. Confirm your service role key and database connection."
          />
        </Reveal>
      )}
    </div>
  );
}
