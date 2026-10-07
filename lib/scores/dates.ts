/** Today's calendar date in UTC (YYYY-MM-DD) for comparisons. */
export function todayIsoDate(reference = new Date()): string {
  return reference.toISOString().slice(0, 10);
}

/** Display label for dashboard chips (e.g. 7 Oct 2026). */
export function formatPlayedOnLabel(playedOn: string, locale = "en-GB"): string {
  const [year, month, day] = playedOn.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
