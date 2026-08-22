const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatTime(iso: string | Date): string {
  return TIME_FORMATTER.format(new Date(iso));
}

export function formatShortDate(iso: string | Date): string {
  return SHORT_DATE_FORMATTER.format(new Date(iso));
}

export function formatLongDate(iso: string | Date): string {
  return LONG_DATE_FORMATTER.format(new Date(iso));
}

const TODAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** e.g. "Saturday, 15 August" */
export function formatTodayLabel(): string {
  return TODAY_LABEL_FORMATTER.format(new Date());
}

function startOfDay(input: string | Date): Date {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function diffDays(input: string | Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(input);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Human-friendly relative label like "Today", "Tomorrow" or "in 3 days". */
export function formatDueLabel(iso: string | Date): string {
  const days = diffDays(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `in ${days} days`;
  if (days < -1) return `${Math.abs(days)} days ago`;
  return formatShortDate(iso);
}

export function isOverdue(iso: string | Date): boolean {
  return new Date(iso).getTime() < Date.now();
}

const RELATIVE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

/** Compact relative time like "just now", "2h ago" or a short date. */
export function formatRelativeTime(iso: string | Date): string {
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return RELATIVE_FORMATTER.format(new Date(iso));
}

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** e.g. "Mon, 10 Aug" (also accepts an ISO date string). */
export function formatDayLabel(iso: string | Date): string {
  return DAY_LABEL_FORMATTER.format(new Date(iso));
}

/** Converts a Date (or ISO string) to a local yyyy-mm-dd string. */
export function toISODate(input: string | Date): string {
  const date =
    input instanceof Date ? input : new Date(`${input}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** ISO dates for `days` consecutive days starting at `startISO`. */
export function weekDates(startISO: string, days = 7): string[] {
  const start = new Date(`${startISO}T00:00:00`);
  return Array.from({ length: days }, (_, index) =>
    toISODate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)),
  );
}
