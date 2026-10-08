import type { SubscriptionAccessLabel } from "@/lib/subscription/grants";
import { cn } from "@/lib/utils";

const TONE_DOT: Record<SubscriptionAccessLabel["tone"], string> = {
  active: "bg-status-active",
  cancelling: "bg-status-pending",
  inactive: "bg-slate",
};

type SubscriptionAccessPillProps = {
  label: SubscriptionAccessLabel;
  className?: string;
};

export function SubscriptionAccessPill({
  label,
  className,
}: SubscriptionAccessPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-navy",
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", TONE_DOT[label.tone])}
        aria-hidden
      />
      <span>{label.label}</span>
    </span>
  );
}
