"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { BentoCard } from "@/components/dashboard/bento-card";
import { updateCharityPercentageAction } from "@/lib/charity/actions";
import { calculateCharityContribution } from "@/lib/charity/contribution";
import {
  formatInrFromPaise,
  getSubscriptionFeePaise,
} from "@/lib/subscription/fees";
import type { SubscriptionPlan } from "@/lib/subscription/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { tabularImpact } from "@/lib/typography";

type DashboardCharityCardProps = {
  charity: {
    name: string;
    slug: string;
    percentage: number;
  } | null;
  plan: SubscriptionPlan | null;
  hasAccess: boolean;
};

export function DashboardCharityCard({
  charity,
  plan,
  hasAccess,
}: DashboardCharityCardProps) {
  const router = useRouter();
  const [percentage, setPercentage] = useState(charity?.percentage ?? 10);
  const [savedPercentage, setSavedPercentage] = useState(charity?.percentage ?? 10);
  const [isPending, startTransition] = useTransition();

  if (!charity) {
    return (
      <BentoCard title="Your charity">
        <DashboardEmptyState
          icon={Heart}
          title="No cause linked yet"
          description="Choose a charity when you sign up, or reach out if your account predates charity selection."
          action={
            <Button variant="secondary" size="sm" render={<Link href="/charities" />}>
              Browse charities
            </Button>
          }
        />
      </BentoCard>
    );
  }

  const feePaise = getSubscriptionFeePaise(plan);
  const liveAmount = calculateCharityContribution(feePaise, percentage);

  function handleSave() {
    startTransition(async () => {
      const result = await updateCharityPercentageAction({ percentage });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setSavedPercentage(result.percentage);
      router.refresh();
    });
  }

  return (
    <BentoCard
      title="Your charity"
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-slate"
          render={<Link href={`/charities/${charity.slug}`} />}
        >
          View
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="font-sans text-xl text-navy">{charity.name}</p>

        {!hasAccess ? (
          <p className="text-sm text-muted-foreground">
            Subscribe to see your live contribution from each billing cycle.
          </p>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate">Share of subscription</span>
            <span className={tabularImpact}>
              <span className="font-sans text-2xl text-coral">{percentage}%</span>
            </span>
          </div>
          <Slider
            min={10}
            max={100}
            step={1}
            value={[percentage]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setPercentage(next ?? 10);
            }}
            disabled={isPending}
            aria-label="Charity contribution percentage"
          />
          <p className={tabularImpact}>
            <span className="text-sm text-slate">Goes to your cause each cycle: </span>
            <span className="font-sans text-lg text-status-active">
              {formatInrFromPaise(liveAmount.amountCents)}
            </span>
            <span className="text-xs text-muted-foreground">
              {" "}
              (based on {plan === "yearly" ? "yearly" : "monthly"} plan)
            </span>
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={isPending || percentage === savedPercentage}
          onClick={handleSave}
        >
          {isPending ? "Saving…" : "Save share"}
        </Button>
      </div>
    </BentoCard>
  );
}
