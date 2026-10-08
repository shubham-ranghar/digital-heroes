"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIER_PERCENTAGES } from "@/lib/draw/constants";
import { calculatePrizePools } from "@/lib/draw/pools";
import { formatCurrency } from "@/lib/money";
import { tabularImpact } from "@/lib/typography";

type PoolCalculatorProps = {
  feePerSubscriber: number;
  poolPercentage: number;
  jackpotCarryover?: number;
};

export function PoolCalculator({
  feePerSubscriber,
  poolPercentage,
  jackpotCarryover = 0,
}: PoolCalculatorProps) {
  const [subscribers, setSubscribers] = useState("250");

  const pools = useMemo(() => {
    const count = Math.max(0, Number(subscribers) || 0);
    return calculatePrizePools(
      count,
      feePerSubscriber,
      poolPercentage,
      jackpotCarryover,
    );
  }, [subscribers, jackpotCarryover, feePerSubscriber, poolPercentage]);

  return (
    <div className="rounded-[20px] border border-line bg-surface p-6">
      <h3 className="font-sans text-lg font-semibold text-foreground">
        Prize pool calculator
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Estimates use the draw fee ({formatCurrency(feePerSubscriber)} per active
        subscriber) and
        the {TIER_PERCENTAGES[5] * 100}% /{" "}
        {TIER_PERCENTAGES[4] * 100}% / {TIER_PERCENTAGES[3] * 100}% tier split.
        Jackpot rollover adds to the 5-match pool only.
      </p>
      <div className="mt-6 space-y-2">
        <Label htmlFor="pool-subscribers">Active subscribers</Label>
        <Input
          id="pool-subscribers"
          type="number"
          min={0}
          inputMode="numeric"
          value={subscribers}
          onChange={(event) => setSubscribers(event.target.value)}
        />
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-cream px-4 py-3">
          <dt className="text-xs text-muted-foreground">Total prize pool</dt>
          <dd className={tabularImpact + " text-xl font-semibold text-foreground"}>
            {formatCurrency(pools.totalPool)}
          </dd>
        </div>
        <div className="rounded-xl bg-cream px-4 py-3">
          <dt className="text-xs text-muted-foreground">5-match (40%)</dt>
          <dd className={tabularImpact + " text-xl font-semibold text-foreground"}>
            {formatCurrency(pools.tier5Pool)}
          </dd>
        </div>
        <div className="rounded-xl bg-cream px-4 py-3">
          <dt className="text-xs text-muted-foreground">4-match (35%)</dt>
          <dd className={tabularImpact + " text-xl font-semibold text-foreground"}>
            {formatCurrency(pools.tier4Pool)}
          </dd>
        </div>
        <div className="rounded-xl bg-cream px-4 py-3">
          <dt className="text-xs text-muted-foreground">3-match (25%)</dt>
          <dd className={tabularImpact + " text-xl font-semibold text-foreground"}>
            {formatCurrency(pools.tier3Pool)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
