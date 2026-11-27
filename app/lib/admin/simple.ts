// app/lib/admin/simple.ts
// Pure helpers shared by the simple admin screens and their API routes.
// No React and no database here, so every rule can be unit-tested.

import type { Role } from './session-token';

// ─── Roles ────────────────────────────────────────────────────────────────────

/** Front-desk staff never see shop-wide money figures; managers and admins do. */
export function canSeeMoney(role: Role | null | undefined): boolean {
  return role === 'admin' || role === 'manager';
}

/**
 * Stock changes, purchases and suppliers are management-only, matching the
 * existing product, purchase and supplier routes.
 */
export function canManageStock(role: Role | null | undefined): boolean {
  return role === 'admin' || role === 'manager';
}

/** Only admins edit shop details and the staff list. */
export function isAdmin(role: Role | null | undefined): boolean {
  return role === 'admin';
}

export function roleLabel(role: Role | null | undefined): string {
  if (role === 'admin') return 'Owner · full access';
  if (role === 'manager') return 'Manager';
  return 'Front desk';
}

export interface NavEntry {
  id: 'home' | 'sale' | 'bills' | 'bookings' | 'customers' | 'orders' | 'products' | 'stock' | 'money';
  label: string;
  href: string;
}

const NAV: readonly NavEntry[] = [
  { id: 'home', label: 'Home', href: '/admin' },
  { id: 'sale', label: 'New sale', href: '/admin/sale' },
  { id: 'bills', label: 'Bills', href: '/admin/bills' },
  { id: 'bookings', label: 'Bookings', href: '/admin/bookings' },
  { id: 'customers', label: 'Customers', href: '/admin/customers' },
  { id: 'orders', label: 'Orders', href: '/admin/orders' },
  { id: 'products', label: 'Products', href: '/admin/products' },
  { id: 'stock', label: 'Stock', href: '/admin/stock' },
  { id: 'money', label: 'Money', href: '/admin/money' },
];

/** Left-menu items the role may see. Staff lose Money. */
export function navFor(role: Role | null | undefined): NavEntry[] {
  return NAV.filter((item) => item.id !== 'money' || canSeeMoney(role));
}

/** Phone tab bar: Home · Sale · Orders · Money (Customers for staff). */
export function tabsFor(role: Role | null | undefined): NavEntry[] {
  const pick = (id: NavEntry['id']) => NAV.find((n) => n.id === id)!;
  return [pick('home'), pick('sale'), pick('orders'), canSeeMoney(role) ? pick('money') : pick('customers')];
}

/** Which nav entry a pathname belongs to. */
export function activeNav(pathname: string): NavEntry['id'] | 'settings' | null {
  if (pathname === '/admin') return 'home';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  if (pathname.startsWith('/admin/eye-test')) return 'customers';
  // Take payment is open to every role, so it highlights Orders (where hand-over
  // sends people to pay) rather than Money, which staff can't see.
  if (pathname.startsWith('/admin/take-payment')) return 'orders';
  if (pathname.startsWith('/admin/new-stock')) return 'stock';
  if (pathname.startsWith('/admin/report')) return 'money';
  const hit = NAV.find((n) => n.id !== 'home' && pathname.startsWith(n.href));
  return hit?.id ?? null;
}

// ─── Money & text ─────────────────────────────────────────────────────────────

/** Rounds to paise so floating-point drift never decides a total. */
export const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** ₹1,26,700 style (Indian grouping), no decimals unless there are paise. */
export function inr(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const hasPaise = Math.round(safe * 100) % 100 !== 0;
  const text = Math.abs(safe).toLocaleString('en-IN', { minimumFractionDigits: hasPaise ? 2 : 0, maximumFractionDigits: 2 });
  return safe < 0 ? `−₹${text}` : `₹${text}`;
}

export function initials(name: string | null | undefined): string {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

/**
 * Builds a WhatsApp click-to-chat link. Indian 10-digit numbers get the 91
 * country code; anything that isn't a plausible number yields null so callers
 * hide the button instead of opening a broken chat.
 */
export function waLink(phone: string | null | undefined, text: string): string | null {
  const digits = String(phone ?? '').replace(/\D/g, '');
  let full: string;
  if (/^[6-9]\d{9}$/.test(digits)) full = `91${digits}`;
  else if (/^91[6-9]\d{9}$/.test(digits)) full = digits;
  else if (/^0[6-9]\d{9}$/.test(digits)) full = `91${digits.slice(1)}`;
  else return null;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  const digits = String(phone ?? '').replace(/[^\d+]/g, '');
  return digits.length >= 7 ? `tel:${digits}` : null;
}

// ─── Dates (shop time, Asia/Kolkata) ──────────────────────────────────────────

const TZ = 'Asia/Kolkata';

/** YYYY-MM-DD in shop time, optionally offset by whole days. */
export function shopDay(offsetDays = 0, now: Date = new Date()): string {
  const d = new Date(now.getTime() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
}

/** "Sunday, 29 November" for a YYYY-MM-DD date. */
export function longDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

/** "26 Nov" for a date or timestamp. */
export function shortDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value).length === 10 ? `${value}T12:00:00+05:30` : String(value));
  if (Number.isNaN(d.getTime())) return '';
  // Add the year for anything outside the current year ("2 Nov 2025").
  const sameYear = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric' }).format(d) === shopDay().slice(0, 4);
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(d);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). Positive when `to` is later. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from.slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${to.slice(0, 10)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function greeting(now: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(now));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface DiscountSettings {
  max_discount_admin?: number | string | null;
  max_discount_manager?: number | string | null;
  max_discount_staff?: number | string | null;
}

/** The highest discount % a role may give, from shop_settings (clamped 0–100). */
export function discountCap(role: Role, settings: DiscountSettings | null | undefined): number {
  const raw = role === 'admin' ? settings?.max_discount_admin ?? 100
    : role === 'manager' ? settings?.max_discount_manager ?? 15
    : settings?.max_discount_staff ?? 5;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
}

export interface SaleLine {
  price: number;
  qty: number;
}

/**
 * Bill totals using exactly the invoice route's arithmetic (tax-exclusive GST
 * after discount, rounded to paise at each step), so "Full amount" on screen
 * always equals what the server will accept.
 */
export function saleTotals(lines: readonly SaleLine[], discountPercent: number, taxRate: number) {
  const subtotal = money(lines.reduce((sum, l) => sum + money(money(l.price) * l.qty), 0));
  const discount = money(subtotal * (discountPercent / 100));
  const taxable = money(subtotal - discount);
  const tax = money(taxable * taxRate / 100);
  const total = money(taxable + tax);
  return { subtotal, discount, tax, total };
}

export type PayChoice = 'full' | 'half' | 'none' | 'other';

/** Amount collected now. "Half" rounds down to the paisa so it never exceeds half; "other" is whatever was typed. */
export function payNow(total: number, choice: PayChoice, other = 0): number {
  if (choice === 'other') return money(other);
  if (choice === 'full') return total;
  // Work in whole paise: 5037.98 * 50 is 251898.999… in floating point.
  if (choice === 'half') return Math.floor(Math.round(total * 100) / 2) / 100;
  return 0;
}

export interface SaleDraftCheck {
  customerId: string | null;
  rx: 'last' | 'new' | 'none' | null;
  eyeTestId: string | null;
  lines: number;
  discount: number;
  cap: number;
  pay: PayChoice | null;
  method: 'cash' | 'upi' | 'card' | null;
  needsLab: boolean;
  readyBy: string;
  /** For pay === 'other': the typed amount and the bill total it must not exceed. */
  otherAmount?: number;
  total?: number;
}

/** Whether "Next" may be pressed on each step of the New sale wizard (0-based). */
export function saleStepValid(step: number, d: SaleDraftCheck, today = shopDay()): boolean {
  switch (step) {
    case 0:
      return !!d.customerId;
    case 1:
      return d.rx === 'none' || (d.rx === 'last' && !!d.eyeTestId);
    case 2:
      return d.lines > 0 && d.discount >= 0 && d.discount <= d.cap;
    case 3:
      if (!d.pay) return false;
      if (d.pay === 'other' && !((d.otherAmount ?? 0) > 0 && (d.otherAmount ?? 0) <= (d.total ?? 0))) return false;
      if (d.pay !== 'none' && !d.method) return false;
      if (d.needsLab && !(/^\d{4}-\d{2}-\d{2}$/.test(d.readyBy) && d.readyBy >= today)) return false;
      return true;
    default:
      return false;
  }
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface OpenBill {
  id: string;
  balance: number;
}

/**
 * Splits a payment across a customer's open bills, oldest first. Callers pass
 * bills already sorted oldest-first and must reject `amount` above the total
 * owed before calling; any remainder that can't be placed is simply not used.
 */
export function allocatePayment(amount: number, bills: readonly OpenBill[]): { id: string; amount: number }[] {
  let left = money(amount);
  const parts: { id: string; amount: number }[] = [];
  for (const bill of bills) {
    if (left <= 0) break;
    const take = money(Math.min(left, money(bill.balance)));
    if (take <= 0) continue;
    parts.push({ id: bill.id, amount: take });
    left = money(left - take);
  }
  return parts;
}

// ─── Eye test values ──────────────────────────────────────────────────────────

export type OpticalField = 'sph' | 'cyl' | 'axis' | 'add' | 'pd';

/** Allowed ranges, shared by the eye test screen and simpleEyeTestSchema. */
export const OPTICS: Record<OpticalField, { min: number; max: number; step: number; label: string; signed: boolean }> = {
  sph: { min: -20, max: 20, step: 0.25, label: 'Power (SPH)', signed: true },
  cyl: { min: -20, max: 20, step: 0.25, label: 'Cylinder (CYL)', signed: true },
  axis: { min: 0, max: 180, step: 1, label: 'Axis', signed: false },
  add: { min: 0, max: 4, step: 0.25, label: 'Reading add (ADD)', signed: true },
  pd: { min: 20, max: 45, step: 0.5, label: 'PD', signed: false },
};

/** Plain-words problem with one typed value, or null when it's fine (blank is fine). */
export function opticalProblem(field: OpticalField, raw: string): string | null {
  const text = raw.trim().replace(/^\+/, '');
  if (!text) return null;
  const n = Number(text);
  const r = OPTICS[field];
  if (!Number.isFinite(n)) return `${r.label} must be a number`;
  if (n < r.min || n > r.max) return `${r.label} must be between ${r.min} and ${r.max}`;
  if (Math.abs(n / r.step - Math.round(n / r.step)) > 1e-9) return `${r.label} goes up in steps of ${r.step}`;
  return null;
}

// ─── Money & reports ──────────────────────────────────────────────────────────

export type Period = 'today' | 'week' | 'month';

/** Inclusive YYYY-MM-DD range for a period ending today. Weeks start on Monday. */
export function periodRange(period: Period, today: string): { from: string; to: string } {
  if (period === 'today') return { from: today, to: today };
  if (period === 'month') return { from: `${today.slice(0, 7)}-01`, to: today };
  const d = new Date(`${today}T00:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7; // Monday → 0 … Sunday → 6
  d.setUTCDate(d.getUTCDate() - back);
  return { from: d.toISOString().slice(0, 10), to: today };
}

/** The month before YYYY-MM. */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

/** The last `count` months, newest first, ending with `month`. */
export function recentMonths(month: string, count = 6): string[] {
  const out = [month];
  while (out.length < count) out.push(previousMonth(out[out.length - 1]));
  return out;
}

export function monthName(month: string, withYear = false): string {
  const d = new Date(`${month}-15T12:00:00Z`);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(d);
}

/** Whole-number % change, or null when there's nothing to compare against. */
export function percentChange(now: number, before: number): number | null {
  if (!before) return null;
  // Divide by the size of the old figure so a loss last month doesn't flip the sign.
  return Math.round(((now - before) / Math.abs(before)) * 100);
}

export const EXPENSE_WORDS: Record<string, string> = {
  rent: 'Shop rent',
  electricity: 'Electricity',
  salary: 'Staff salary',
  transport: 'Travel & delivery',
  maintenance: 'Repairs',
  marketing: 'Advertising',
  supplies: 'Shop supplies',
  other: 'Other',
};

export const CATEGORY_WORDS: Record<string, string> = {
  frame: 'Frames',
  lens: 'Lenses',
  sunglass: 'Sunglasses',
  accessory: 'Accessories',
  service: 'Eye tests & services',
};

// ─── Activity (audit log) in plain words ──────────────────────────────────────

const AUDIT_RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Created invoice (\S+) for (.+?) - Rs\.([\d.]+)$/, (m) => `made bill ${m[1]} for ${m[2]} (${inr(m[3])})`],
  [/^Payment of ₹([\d.]+) via (\w+) on invoice (\S+)$/, (m) => `took ${inr(m[1])} by ${m[2] === 'upi' ? 'UPI' : m[2]} for bill ${m[3]}`],
  [/^Cancelled invoice (\S+)$/, (m) => `cancelled bill ${m[1]}`],
  [/^Order status changed to '(\w+)' on invoice (\S+)$/, (m) => `marked order ${m[2]} as ${m[1] === 'delivered' ? 'handed over' : m[1].replace('_', ' ')}`],
  [/^Told (.+) that order (\S+) is ready$/, (m) => `told ${m[1]} their glasses are ready (${m[2]})`],
  [/^New eye test for: (.+)$/, (m) => `saved an eye test for ${m[1]}`],
  [/^Created customer: (.+?) \(.+\)$/, (m) => `added customer ${m[1]}`],
  [/^Purchase (\S+) from (.+?) — ₹([\d.]+)$/, (m) => `recorded stock from ${m[2]} (${m[1]}, ${inr(m[3])})`],
  [/^Expense ₹([\d.]+) — (\w+): (.*)$/, (m) => `added an expense of ${inr(m[1])} for ${(EXPENSE_WORDS_LOWER[m[2]] ?? m[2])}`],
  [/^Updated shop settings$/, () => 'changed the shop settings'],
];
const EXPENSE_WORDS_LOWER: Record<string, string> = {
  rent: 'shop rent', electricity: 'electricity', salary: 'staff salary', transport: 'travel & delivery',
  maintenance: 'repairs', marketing: 'advertising', supplies: 'shop supplies', other: 'other things',
};

/** "Anu made bill DO-2026-00418 for Priya Raman (₹14,800)". Unknown entries fall back to their own text. */
export function auditSentence(log: { performed_by: string; details: string }): string {
  const details = String(log.details ?? '').trim();
  for (const [re, say] of AUDIT_RULES) {
    const m = details.match(re);
    if (m) return `${log.performed_by} ${say(m)}`;
  }
  return `${log.performed_by}: ${details.charAt(0).toLowerCase()}${details.slice(1)}`;
}
