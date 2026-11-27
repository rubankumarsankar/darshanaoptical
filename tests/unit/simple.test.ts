import { describe, expect, it } from 'vitest';
import {
  activeNav,
  allocatePayment,
  auditSentence,
  canSeeMoney,
  daysBetween,
  discountCap,
  initials,
  inr,
  isAdmin,
  money,
  navFor,
  opticalProblem,
  payNow,
  percentChange,
  periodRange,
  previousMonth,
  recentMonths,
  saleStepValid,
  saleTotals,
  shopDay,
  shortDate,
  tabsFor,
  waLink,
} from '@/app/lib/admin/simple';

describe('simple admin role visibility', () => {
  it('only managers and admins can see money', () => {
    expect(canSeeMoney('admin')).toBe(true);
    expect(canSeeMoney('manager')).toBe(true);
    expect(canSeeMoney('staff')).toBe(false);
    expect(canSeeMoney(null)).toBe(false);
  });

  it('hides the Money menu item from staff', () => {
    expect(navFor('staff').map((n) => n.id)).toEqual(['home', 'sale', 'bills', 'bookings', 'customers', 'orders', 'products', 'stock']);
    expect(navFor('manager').map((n) => n.id)).toContain('money');
    expect(navFor('admin').map((n) => n.id)).toContain('money');
  });

  it('gives Bills and Products their own menu items', () => {
    for (const role of ['admin', 'manager', 'staff'] as const) expect(navFor(role).map((n) => n.id)).toEqual(expect.arrayContaining(['bills', 'products']));
  });

  it('gives staff a Customers tab instead of Money on phones', () => {
    expect(tabsFor('admin').map((t) => t.id)).toEqual(['home', 'sale', 'orders', 'money']);
    expect(tabsFor('staff').map((t) => t.id)).toEqual(['home', 'sale', 'orders', 'customers']);
  });

  it('only admins are admins', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('manager')).toBe(false);
    expect(isAdmin('staff')).toBe(false);
  });

  it('maps paths to the right menu item', () => {
    expect(activeNav('/admin')).toBe('home');
    expect(activeNav('/admin/sale')).toBe('sale');
    expect(activeNav('/admin/orders')).toBe('orders');
    expect(activeNav('/admin/settings/staff')).toBe('settings');
    expect(activeNav('/admin/new-stock')).toBe('stock');
    expect(activeNav('/admin/report')).toBe('money');
    expect(activeNav('/admin/bills')).toBe('bills');
    expect(activeNav('/admin/products')).toBe('products');
    // Payment is open to staff, so it must not light up the Money item.
    expect(activeNav('/admin/take-payment')).toBe('orders');
  });
});

describe('waLink', () => {
  it('adds the India country code to 10-digit mobiles and encodes the text', () => {
    expect(waLink('98400 12345', 'Hi & bye?')).toBe('https://wa.me/919840012345?text=Hi%20%26%20bye%3F');
    expect(waLink('+91 98400-12345', 'x')).toBe('https://wa.me/919840012345?text=x');
    expect(waLink('09840012345', 'x')).toBe('https://wa.me/919840012345?text=x');
  });

  it('returns null for numbers that cannot be a mobile', () => {
    expect(waLink('12345', 'x')).toBeNull();
    expect(waLink('', 'x')).toBeNull();
    expect(waLink(null, 'x')).toBeNull();
    expect(waLink('5840012345', 'x')).toBeNull();
  });

  it('cannot be used to inject another URL', () => {
    const link = waLink('9840012345', 'https://evil.example/?a=1#x')!;
    expect(link.startsWith('https://wa.me/919840012345?text=')).toBe(true);
    expect(link).not.toContain('#x');
  });
});

describe('formatting helpers', () => {
  it('formats rupees with Indian grouping', () => {
    expect(inr(126700)).toBe('₹1,26,700');
    expect(inr('1499.5')).toBe('₹1,499.50');
    expect(inr(undefined)).toBe('₹0');
    expect(inr('nonsense')).toBe('₹0');
    expect(inr(-350)).toBe('−₹350');
  });

  it('rounds money to paise', () => {
    expect(money(0.7 + 0.1)).toBe(0.8);
    expect(money(1.005)).toBe(1.01);
  });

  it('builds initials', () => {
    expect(initials('Priya Raman')).toBe('PR');
    expect(initials('anu')).toBe('AN');
    expect(initials('  ')).toBe('?');
  });

  it('works out day offsets in shop time', () => {
    const now = new Date('2026-11-26T20:00:00Z'); // 01:30 on the 27th in India
    expect(shopDay(0, now)).toBe('2026-11-27');
    expect(shopDay(3, now)).toBe('2026-11-30');
    expect(daysBetween('2026-11-27', '2026-11-30')).toBe(3);
    expect(daysBetween('2026-11-30', '2026-11-27')).toBe(-3);
  });
});


describe('sale maths', () => {
  it('matches the invoice route: discount first, then tax-exclusive GST, rounded to paise', () => {
    // 2490 + 2100 = 4590; 5% off = 229.50; taxable 4360.50; 12% GST = 523.26
    expect(saleTotals([{ price: 2490, qty: 1 }, { price: 2100, qty: 1 }], 5, 12)).toEqual({
      subtotal: 4590, discount: 229.5, tax: 523.26, total: 4883.76,
    });
    expect(saleTotals([], 0, 18)).toEqual({ subtotal: 0, discount: 0, tax: 0, total: 0 });
    expect(saleTotals([{ price: 999.99, qty: 3 }], 0, 0).total).toBe(2999.97);
  });

  it('never takes more than half for an advance', () => {
    expect(payNow(4883.76, 'half')).toBe(2441.88);
    expect(payNow(101, 'half')).toBe(50.5);
    expect(payNow(0.03, 'half')).toBe(0.01);
    expect(payNow(5037.98, 'half')).toBe(2518.99);
    expect(payNow(500, 'full')).toBe(500);
    expect(payNow(500, 'none')).toBe(0);
    expect(payNow(500, 'other', 123.456)).toBe(123.46);
  });

  it('reads the per-role discount ceiling from settings', () => {
    const settings = { max_discount_admin: 100, max_discount_manager: 15, max_discount_staff: 5 };
    expect(discountCap('staff', settings)).toBe(5);
    expect(discountCap('manager', settings)).toBe(15);
    expect(discountCap('admin', settings)).toBe(100);
    expect(discountCap('staff', { max_discount_staff: 250 })).toBe(100);
    expect(discountCap('staff', { max_discount_staff: 'junk' })).toBe(0);
    expect(discountCap('staff', null)).toBe(5);
  });
});

describe('New sale wizard validation', () => {
  const base = {
    customerId: 'c1', rx: 'none' as const, eyeTestId: null, lines: 1, discount: 0, cap: 5,
    pay: 'full' as const, method: 'upi' as const, needsLab: false, readyBy: '2026-11-30',
  };
  const today = '2026-11-27';

  it('step 1 needs a customer', () => {
    expect(saleStepValid(0, { ...base, customerId: null }, today)).toBe(false);
    expect(saleStepValid(0, base, today)).toBe(true);
  });

  it('step 2 needs a power choice; "last test" needs a test', () => {
    expect(saleStepValid(1, { ...base, rx: null }, today)).toBe(false);
    expect(saleStepValid(1, { ...base, rx: 'last', eyeTestId: null }, today)).toBe(false);
    expect(saleStepValid(1, { ...base, rx: 'last', eyeTestId: 't1' }, today)).toBe(true);
    // "New test" leaves the wizard, so it can't be the answer that enables Next.
    expect(saleStepValid(1, { ...base, rx: 'new' }, today)).toBe(false);
    expect(saleStepValid(1, base, today)).toBe(true);
  });

  it('step 3 needs an item and a discount within the ceiling', () => {
    expect(saleStepValid(2, { ...base, lines: 0 }, today)).toBe(false);
    expect(saleStepValid(2, { ...base, discount: 6 }, today)).toBe(false);
    expect(saleStepValid(2, { ...base, discount: 5 }, today)).toBe(true);
  });

  it('step 4 needs a payment method unless nothing is paid, and a future ready date for lab orders', () => {
    expect(saleStepValid(3, { ...base, method: null }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, pay: 'none', method: null }, today)).toBe(true);
    expect(saleStepValid(3, { ...base, pay: null }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, needsLab: true, readyBy: '2026-11-20' }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, needsLab: true, readyBy: 'soon' }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, needsLab: true, readyBy: '2026-11-30' }, today)).toBe(true);
    // "Other amount" must be more than zero and no more than the bill.
    expect(saleStepValid(3, { ...base, pay: 'other', otherAmount: 0, total: 1000 }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, pay: 'other', otherAmount: 1000.01, total: 1000 }, today)).toBe(false);
    expect(saleStepValid(3, { ...base, pay: 'other', otherAmount: 400, total: 1000 }, today)).toBe(true);
  });
});

describe('allocatePayment', () => {
  const bills = [{ id: 'old', balance: 1000 }, { id: 'mid', balance: 250.5 }, { id: 'new', balance: 4000 }];

  it('fills the oldest bills first', () => {
    expect(allocatePayment(1100, bills)).toEqual([{ id: 'old', amount: 1000 }, { id: 'mid', amount: 100 }]);
  });

  it('can clear several bills exactly', () => {
    expect(allocatePayment(1250.5, bills)).toEqual([{ id: 'old', amount: 1000 }, { id: 'mid', amount: 250.5 }]);
  });

  it('never puts more on a bill than it owes', () => {
    const parts = allocatePayment(5250.5, bills);
    expect(parts.map((p) => p.amount)).toEqual([1000, 250.5, 4000]);
  });

  it('skips settled bills and handles paise', () => {
    expect(allocatePayment(0.3, [{ id: 'a', balance: 0 }, { id: 'b', balance: 0.1 }, { id: 'c', balance: 0.2 }])).toEqual([
      { id: 'b', amount: 0.1 },
      { id: 'c', amount: 0.2 },
    ]);
  });
});

describe('opticalProblem', () => {
  it('accepts blanks and valid optical values', () => {
    for (const [f, v] of [['sph', ''], ['sph', '-1.75'], ['sph', '+20'], ['cyl', '-0.25'], ['axis', '180'], ['add', '2.5'], ['pd', '31.5']] as const) {
      expect(opticalProblem(f, v)).toBeNull();
    }
  });

  it('explains what is wrong in plain words', () => {
    expect(opticalProblem('sph', '-20.25')).toBe('Power (SPH) must be between -20 and 20');
    expect(opticalProblem('sph', '1.3')).toBe('Power (SPH) goes up in steps of 0.25');
    expect(opticalProblem('axis', '181')).toBe('Axis must be between 0 and 180');
    expect(opticalProblem('axis', '90.5')).toBe('Axis goes up in steps of 1');
    expect(opticalProblem('cyl', 'abc')).toBe('Cylinder (CYL) must be a number');
  });
});

describe('periods and months', () => {
  it('works out Today / This week (from Monday) / This month', () => {
    expect(periodRange('today', '2026-11-27')).toEqual({ from: '2026-11-27', to: '2026-11-27' });
    expect(periodRange('week', '2026-11-27')).toEqual({ from: '2026-11-23', to: '2026-11-27' }); // Friday → Monday
    expect(periodRange('week', '2026-11-23')).toEqual({ from: '2026-11-23', to: '2026-11-23' }); // Monday
    expect(periodRange('week', '2026-11-29')).toEqual({ from: '2026-11-23', to: '2026-11-29' }); // Sunday
    expect(periodRange('month', '2026-11-27')).toEqual({ from: '2026-11-01', to: '2026-11-27' });
  });

  it('steps back through months across a year end', () => {
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(recentMonths('2026-02')).toEqual(['2026-02', '2026-01', '2025-12', '2025-11', '2025-10', '2025-09']);
  });

  it('reports % change sensibly', () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(80, 100)).toBe(-20);
    expect(percentChange(50, 0)).toBeNull();
    // Going from a ₹100 loss to a ₹50 profit is an improvement, not a fall.
    expect(percentChange(50, -100)).toBe(150);
  });
});

describe('auditSentence', () => {
  const say = (details: string) => auditSentence({ performed_by: 'Anu', details });

  it('turns audit entries into plain sentences', () => {
    expect(say('Created invoice DO-2026-00418 for Priya Raman - Rs.14800')).toBe('Anu made bill DO-2026-00418 for Priya Raman (₹14,800)');
    expect(say('Payment of ₹1500 via upi on invoice DO-2026-00001')).toBe('Anu took ₹1,500 by UPI for bill DO-2026-00001');
    expect(say("Order status changed to 'delivered' on invoice DO-2026-00007")).toBe('Anu marked order DO-2026-00007 as handed over');
    expect(say('New eye test for: Sneha Pillai')).toBe('Anu saved an eye test for Sneha Pillai');
    expect(say('Created customer: Ravi Kumar (9710045098)')).toBe('Anu added customer Ravi Kumar');
    expect(say('Expense ₹2350 — electricity: Electricity')).toBe('Anu added an expense of ₹2,350 for electricity');
    expect(say('Told Meena that order DO-2026-00371 is ready')).toBe('Anu told Meena their glasses are ready (DO-2026-00371)');
  });

  it('falls back to the original text for anything else', () => {
    expect(say('Marked appointment #4 as confirmed')).toBe('Anu: marked appointment #4 as confirmed');
  });
});

describe('shortDate', () => {
  it('adds the year only for dates outside the current year', () => {
    const thisYear = shopDay().slice(0, 4);
    expect(shortDate(`${thisYear}-03-05`)).not.toMatch(/\d{4}/);
    expect(shortDate('2019-11-02')).toMatch(/2019/);
  });
});
