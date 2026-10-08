"use client";

import { StatCard } from "@/components/ui/stat-card";
import type { AdminReports } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/money";
import { Users, Trophy, Heart, BarChart3 } from "lucide-react";

type AdminReportsPanelProps = {
  reports: AdminReports;
};

function SimpleBarChart({
  data,
  valueKey,
  labelKey,
}: {
  data: { [key: string]: string | number }[];
  valueKey: string;
  labelKey: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);

  return (
    <div className="flex h-40 items-end gap-2 pt-4">
      {data.map((item) => {
        const value = Number(item[valueKey]);
        const height = Math.max(8, (value / max) * 100);
        return (
          <div
            key={String(item[labelKey])}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs tabular-impact text-coral">{value}</span>
            <div
              className="w-full rounded-t-lg bg-coral/80 transition-all"
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-slate text-center leading-tight">
              {String(item[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminReportsPanel({ reports }: AdminReportsPanelProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={reports.totalUsers}
          icon={Users}
        />
        <StatCard
          label="Active subscribers"
          value={reports.activeSubscribers}
          icon={Users}
          trend="Server-verified access"
        />
        <StatCard
          label="Estimated prize pool (active subscribers × fee)"
          value={reports.estimatedPrizePool}
          valueLabel={formatCurrency(reports.estimatedPrizePool)}
          animate={false}
          icon={Trophy}
        />
        <StatCard
          label="Total charity contribution"
          value={reports.totalCharityContribution}
          valueLabel={formatCurrency(reports.totalCharityContribution, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          animate={false}
          icon={Heart}
          trend={`${formatCurrency(reports.charityCommittedInr, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}/mo committed · ${formatCurrency(reports.donationTotalInr, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} one-off`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-line bg-surface p-5">
          <h3 className="font-sans text-lg text-navy">Prize payouts</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate">Paid out</p>
              <p className="font-sans text-2xl text-status-active">
                {formatCurrency(reports.totalPrizePaid)}
              </p>
            </div>
            <div>
              <p className="text-slate">Pending</p>
              <p className="font-sans text-2xl text-status-pending">
                {formatCurrency(reports.totalPrizePending)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-line bg-surface p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-coral" aria-hidden />
            <h3 className="font-sans text-lg text-navy">Draws by status</h3>
          </div>
          {reports.drawsByStatus.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No draws recorded.</p>
          ) : (
            <SimpleBarChart
              data={reports.drawsByStatus.map((row) => ({
                status: row.status,
                count: row.count,
              }))}
              labelKey="status"
              valueKey="count"
            />
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-line bg-surface p-5">
        <h3 className="font-sans text-lg text-navy">Entries per draw (latest)</h3>
        {reports.entriesPerDraw.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No entry data yet.</p>
        ) : (
          <SimpleBarChart
            data={reports.entriesPerDraw.map((row) => ({
              month: row.month,
              count: row.count,
            }))}
            labelKey="month"
            valueKey="count"
          />
        )}
      </div>
    </div>
  );
}
