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
