import Link from "next/link";
import { connection } from "next/server";
import { FileCheck, Sparkles, Target, UserPlus } from "lucide-react";

import { AdminSection } from "@/components/admin/admin-section";
import { StatusPill } from "@/components/admin/status-pill";
import {
  getAdminOverviewStats,
  getAdminRecentActivity,
  type AdminActivityEvent,
} from "@/lib/admin/overview";
import { requireAdmin } from "@/lib/auth/session";
import { formatMonthLabel, formatRelativeTime } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { EmptyPageState } from "@/components/ui/page-state";
import { tabularImpact } from "@/lib/typography";
import { editorialKeyNumber } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

export const instant = false;

const ACTIVITY_ICONS = {
  signup: UserPlus,
  score: Target,
  draw_published: Sparkles,
  proof_submitted: FileCheck,
} as const;

export default async function AdminIndexPage() {
  await connection();
  await requireAdmin();

  let stats = null;
  let activity: AdminActivityEvent[] = [];
  try {
    stats = await getAdminOverviewStats();
    activity = await getAdminRecentActivity();
  } catch {
    stats = null;
  }

  type OverviewCard = {
    label: string;
    value: string | number;
    /** One line of context under the figure. */
    context?: string;
    /** Text status rather than a figure — stays in sans. */
    text?: boolean;
    /** The page's single navy emphasis surface. */
    navy?: boolean;
  };

  const cards: OverviewCard[] = stats
    ? [
        {
          label: "Total users",
          value: stats.totalUsers,
          context: "all registered accounts",
        },
        {
          label: "Active subscribers",
          value: stats.activeSubscribers,
          context: `${stats.activeSubscribers} of ${stats.totalUsers} users`,
        },
        {
          label: "Estimated prize pool",
          value: formatCurrency(stats.currentPrizePool),
          context: "active subscribers × fee",
          navy: true,
        },
        {
          label: "Current draw status",
          value:
            stats.nextDrawStatus.charAt(0).toUpperCase() +
            stats.nextDrawStatus.slice(1),
          context: stats.currentDrawMonth
            ? formatMonthLabel(stats.currentDrawMonth)
            : "no draw scheduled",
          text: true,
        },
        {
          label: "Pending verifications",
          value: stats.pendingWinnerVerifications,
          context:
            stats.pendingWinnerVerifications === 0
              ? "nothing awaiting review"
              : `${stats.pendingWinnerVerifications} awaiting review`,
        },
        {
          label: "Unread messages",
          value: stats.unreadContactMessages,
          context:
            stats.unreadContactMessages === 0
              ? "inbox clear"
              : "from the contact form",
        },
      ]
    : [];

  return (
    <div className="space-y-10">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<em>Overview</em>}
          description="Platform metrics at a glance."
        />
      </Reveal>
      {stats ? (
        <>
          <RevealStagger
            trigger="mount"
            stagger={0.06}
            as="div"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card) => (
              <RevealStaggerItem key={card.label} as="div" fast>
                <div
                  data-nav-theme={card.navy ? "dark" : undefined}
                  className={cn(
                    "rounded-[20px] border p-5",
                    card.navy
                      ? "section-navy border-navy bg-navy shadow-raised"
                      : "border-line bg-surface",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      card.navy ? "text-cream/75" : "text-muted-foreground",
                    )}
                  >
                    {card.label}
                  </p>
                  <p
                    className={cn(
                      "mt-2",
                      card.text
                        ? cn(
                            "text-2xl font-semibold",
                            card.navy ? "text-cream" : "text-navy",
                            tabularImpact,
                          )
                        : cn("text-[2rem]", editorialKeyNumber),
                    )}
                  >
                    {card.value}
                  </p>
                  {card.context ? (
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        card.navy ? "text-cream/70" : "text-slate",
                        tabularImpact,
                      )}
                    >
                      {card.context}
                    </p>
                  ) : null}
                </div>
              </RevealStaggerItem>
            ))}
          </RevealStagger>

          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal trigger="mount" fast>
              <section className="h-full rounded-[20px] border border-line bg-surface p-5">
                <h2 className="font-sans text-lg text-navy">Recent activity</h2>
                {activity.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No activity yet. Signups, scores, draws and proof uploads
                    will appear here.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-line">
                    {activity.map((event) => {
                      const Icon = ACTIVITY_ICONS[event.kind];
                      return (
                        <li
                          key={event.id}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-coral/12 text-coral">
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm text-navy",
                              tabularImpact,
                            )}
                          >
                            {event.label}
                          </span>
                          <span className="shrink-0 text-xs text-slate">
                            {formatRelativeTime(event.at)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </Reveal>

            <Reveal trigger="mount" fast>
              <section className="flex h-full flex-col rounded-[20px] border border-line bg-surface p-5">
                <h2 className="font-sans text-lg text-navy">Active draw</h2>
                {stats.currentDrawMonth ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-sans text-xl text-navy">
                        {formatMonthLabel(stats.currentDrawMonth)}
                      </p>
                      <StatusPill value={stats.nextDrawStatus} />
                    </div>
                    <p className={cn("text-sm text-slate", tabularImpact)}>
                      {stats.currentDrawEntries}{" "}
                      {stats.currentDrawEntries === 1 ? "entry" : "entries"} ·
                      pool {formatCurrency(stats.currentPrizePool)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No draw for this month yet — create a draft to get the
                    cycle moving.
                  </p>
                )}
                <div className="mt-auto pt-4">
                  <Button size="sm" render={<Link href="/admin/draws" />}>
                    {stats.currentDrawMonth ? "Manage draw" : "Create draft"}
                  </Button>
                </div>
              </section>
            </Reveal>
          </div>
        </>
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
