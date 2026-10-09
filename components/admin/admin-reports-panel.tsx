"use client";

import { CountUpCurrency } from "@/components/draw/count-up-currency";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminReports } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";
import { editorialKeyNumber } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";
import { Users, Trophy, Heart, BarChart3 } from "lucide-react";

type AdminReportsPanelProps = {
  reports: AdminReports;
};

function formatWholeRupees(amount: number): string {
  return formatCurrency(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

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
            <span className="font-serif text-sm italic tabular-impact text-navy">{value}</span>
            <div
              className="w-full rounded-t-lg bg-coral/80"
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total users"
          value={reports.totalUsers}
          duration={1000}
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
          valueLabel={
            <CountUpCurrency value={reports.estimatedPrizePool} duration={1000} />
          }
          animate={false}
          icon={Trophy}
        />
      </div>

      <div className="rounded-[20px] border border-line bg-surface p-5">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-coral" aria-hidden />
          <h3 className="font-sans text-lg text-navy">Charity contributions</h3>
        </div>
        {/* A monthly rate and a cumulative sum: shown side by side, never added. */}
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate">Committed per month</p>
            <p className={cn("mt-1 text-[2rem]", editorialKeyNumber, "text-navy")}>
              {formatWholeRupees(reports.charityCommitmentPerMonthInr)}
              <span className="ml-1 text-base text-slate">/ month</span>
            </p>
            <p className="mt-1 text-xs text-slate">
              Active subscribers&apos; chosen share of the monthly fee
            </p>
          </div>
          <div>
            <p className="text-slate">One-off donations (all time)</p>
            <p className={cn("mt-1 text-[2rem]", editorialKeyNumber, "text-navy")}>
              {formatWholeRupees(reports.donationTotalInr)}
            </p>
            <p className="mt-1 text-xs text-slate">Completed donations only</p>
          </div>
        </div>

        <h4 className="mt-6 font-sans text-base text-navy">By charity</h4>
        {reports.charityBreakdown.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No charities yet.</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Charity</TableHead>
                <TableHead className="text-right">Active supporters</TableHead>
                <TableHead className="text-right">Committed / month</TableHead>
                <TableHead className="text-right">Donations (all time)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.charityBreakdown.map((row) => (
                <TableRow key={row.charityId}>
                  <TableCell className="text-navy">{row.name}</TableCell>
                  <TableCell className={cn("text-right", tabularImpact)}>
                    {row.activeSupporters}
                  </TableCell>
                  <TableCell className={cn("text-right", tabularImpact)}>
                    {formatWholeRupees(row.commitmentPerMonthInr)}
                  </TableCell>
                  <TableCell className={cn("text-right", tabularImpact)}>
                    {formatWholeRupees(row.donationTotalInr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-line bg-surface p-5">
          <h3 className="font-sans text-lg text-navy">Prize payouts</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate">Paid out</p>
              <p className={cn("mt-1 text-[2rem]", editorialKeyNumber, "text-status-active")}>
                {formatCurrency(reports.totalPrizePaid)}
              </p>
            </div>
            <div>
              <p className="text-slate">Pending</p>
              <p className={cn("mt-1 text-[2rem]", editorialKeyNumber, "text-status-pending")}>
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
