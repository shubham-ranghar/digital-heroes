import { cn } from "@/lib/utils";

type StatusPillProps = {
  value: string;
  className?: string;
};

type StatusTone = "active" | "pending" | "danger" | "neutral";

const DOT_CLASS: Record<StatusTone, string> = {
  active: "bg-status-active",
  pending: "bg-status-pending",
  danger: "bg-status-danger",
  neutral: "bg-slate",
};

const ACTIVE = new Set(["active", "approved", "paid", "published", "succeeded"]);
const PENDING = new Set(["pending", "draft", "simulated", "cancelled"]);
const DANGER = new Set(["rejected", "lapsed", "failed"]);

function normalizeKey(value: string) {
  return value.toLowerCase().replaceAll("_", " ").trim();
}

function resolveStatus(raw: string): { label: string; tone: StatusTone } {
  const key = normalizeKey(raw);

  if (ACTIVE.has(key)) {
    if (key === "paid" || key === "succeeded" || key === "approved") {
      return { label: "Paid", tone: "active" };
    }
    return { label: "Active", tone: "active" };
  }

  if (PENDING.has(key)) {
    return { label: "Pending", tone: "pending" };
  }

  if (DANGER.has(key)) {
    if (key === "lapsed") {
      return { label: "Lapsed", tone: "danger" };
    }
    return { label: "Rejected", tone: "danger" };
  }

  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return { label, tone: "neutral" };
}

export function StatusPill({ value, className }: StatusPillProps) {
  const { label, tone } = resolveStatus(value);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-navy",
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[tone])}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
