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

/**
 * Tone only. The label is always the value itself (schema vocabulary: draft /
 * simulated / published, pending / approved / rejected, pending / paid, ...),
 * so the same status reads the same on every surface. Booleans such as
 * "featured" are not statuses and must not be routed through this pill.
 */
const TONE_BY_VALUE: Record<string, StatusTone> = {
  active: "active",
  approved: "active",
  paid: "active",
  published: "active",
  succeeded: "active",
  pending: "pending",
  draft: "pending",
  simulated: "pending",
  cancelled: "pending",
  "past due": "pending",
  rejected: "danger",
  lapsed: "danger",
  failed: "danger",
};

/** Values with a clearer label than their raw form. */
const LABEL_OVERRIDES: Record<string, string> = {
  none: "No payouts yet",
};

function normalizeKey(value: string) {
  return value.toLowerCase().replaceAll("_", " ").trim();
}

function resolveStatus(raw: string): { label: string; tone: StatusTone } {
  const key = normalizeKey(raw);
  const label =
    LABEL_OVERRIDES[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
  return { label, tone: TONE_BY_VALUE[key] ?? "neutral" };
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
