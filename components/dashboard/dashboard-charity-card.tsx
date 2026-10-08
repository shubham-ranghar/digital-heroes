"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, useInView, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { BentoCard } from "@/components/dashboard/bento-card";
import { updateCharityPercentageAction } from "@/lib/charity/actions";
import { calculateCharityContribution } from "@/lib/charity/contribution";
import { formatMoney } from "@/lib/money";
import { getSubscriptionFeePaise } from "@/lib/subscription/fees";
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
      <BentoCard title="Your charity" icon={Heart}>
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
      icon={Heart}
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
            Update your cause and share in{" "}
            <Link href="/dashboard/settings" className="text-coral underline">
              settings
            </Link>
            . Live billing amounts appear when your membership is active.
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
            disabled={isPending || !hasAccess}
            aria-label="Charity contribution percentage"
          />
          <SavedShareBar percentage={savedPercentage} />
          <p className={tabularImpact}>
            <span className="text-sm text-slate">Goes to your cause each cycle: </span>
            <span className="font-sans text-lg text-status-active">
              {formatMoney(liveAmount.amountCents)}
            </span>
            <span className="text-xs text-muted-foreground">
              {" "}
              (based on {plan === "yearly" ? "yearly" : "monthly"} plan)
            </span>
          </p>
        </div>

        {hasAccess ? (
          <Button
            type="button"
            size="sm"
            disabled={percentage === savedPercentage}
            loading={isPending}
            onClick={handleSave}
          >
            {isPending ? "Saving…" : "Save share"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            render={<Link href="/dashboard/settings" />}
          >
            Edit in settings
          </Button>
        )}
      </div>
    </BentoCard>
  );
}

/**
 * Committed share (last saved %), springing to its value when it scrolls into
 * view and again after each save. The slider above stays 1:1 with the pointer.
 * scaleX only; the track clips the fill so no radius distorts mid-spring.
 * Decorative: the percentage is already shown as text.
 */
function SavedShareBar({ percentage }: { percentage: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const scale = useSpring(0, { stiffness: 200, damping: 25 });
  const target = Math.min(100, Math.max(0, percentage)) / 100;

  useEffect(() => {
    if (!inView) {
      return;
    }
    if (reduceMotion) {
      scale.jump(target);
    } else {
      scale.set(target);
    }
  }, [inView, reduceMotion, scale, target]);

  return (
    <div
      ref={ref}
      className="h-1 overflow-hidden rounded-full bg-status-active/15"
      aria-hidden
    >
      <m.div
        className="h-full origin-left bg-status-active"
        style={{ scaleX: scale }}
      />
    </div>
  );
}
