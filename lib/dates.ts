/**
 * Single source for displayed dates. Every date the app *shows* goes through
 * these (native date inputs keep their own locale format). The app voice is
 * "8 Oct 2026" — en-GB day-first, short month.
 */
const DATE_LOCALE = "en-GB";

/** "8 Oct 2026" from an ISO date (YYYY-MM-DD) or timestamp. */
export function formatDateLabel(iso: string): string {
  const date = parseIso(iso);
  return date.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "October 2026" for month-keyed records such as draws (YYYY-MM-01). */
export function formatMonthLabel(iso: string): string {
  const date = parseIso(iso);
  return date.toLocaleDateString(DATE_LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "8 Oct 2026, 14:32" for timestamps (messages, activity). Local time. */
export function formatDateTimeLabel(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString(DATE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day}, ${time}`;
}

/** "just now" / "5m ago" / "3h ago" / "2d ago"; older falls back to the date. */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const seconds = Math.round((now.getTime() - then) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 14) {
    return `${days}d ago`;
  }
  return formatDateLabel(iso);
}

/** Date-only strings are calendar dates; pin them to UTC noon so the label
 * never shifts a day in any timezone. Timestamps parse as-is. */
function parseIso(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(`${iso}T12:00:00Z`);
  }
  return new Date(iso);
}
