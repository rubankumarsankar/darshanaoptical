export const SHOP_TIME_ZONE = 'Asia/Kolkata';

/** Returns YYYY-MM-DD for the shop calendar, independent of server timezone. */
export function shopDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

/**
 * UTC bounds of one shop day, as 'YYYY-MM-DD HH:MM:SS' strings, for index-friendly
 * filters like `created_at >= ? AND created_at < ?` on UTC DATETIME columns.
 * India has no daylight saving, so the shop day always starts at 18:30 UTC the day before.
 */
export function shopDayUtcRange(day: string): [string, string] {
  const start = new Date(`${day}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
  return [fmt(start), fmt(end)];
}
