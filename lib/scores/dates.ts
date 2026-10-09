import { formatDateLabel } from "@/lib/dates";

/** Today's calendar date in UTC (YYYY-MM-DD) for comparisons. */
export function todayIsoDate(reference = new Date()): string {
  return reference.toISOString().slice(0, 10);
}

/** Display label for dashboard chips (e.g. 7 Oct 2026). */
export function formatPlayedOnLabel(playedOn: string): string {
  return formatDateLabel(playedOn);
}
