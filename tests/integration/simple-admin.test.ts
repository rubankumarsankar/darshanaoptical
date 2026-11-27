// Endpoints added for the simple admin (/api/admin/simple/*) and the
// extensions made to existing routes for it.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';
import { saleTotals } from '@/app/lib/admin/simple';

// ─── Test doubles ─────────────────────────────────────────────────────────────

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  /** Every SQL statement run, in order, with its parameters. */
  log: [] as { sql: string; params: any[]; tx: boolean }[],
  /** Regex → rows. First match wins; unmatched SELECTs return []. */
  rows: [] as [RegExp, any[] | ((params: any[]) => any[])][],
  /** Throw when a transactional statement matches, to prove rollback. */
  failOn: null as RegExp | null,
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (state.cookie !== undefined ? { name, value: state.cookie } : undefined),
  }),
}));

vi.mock('@/app/lib/db', () => {
  const run = (tx: boolean) => async (sql: string, params: any[] = []) => {
    state.log.push({ sql, params, tx });
    if (tx && state.failOn?.test(sql)) throw new Error('simulated database failure');
    // The session lookup requireSession() runs on every request.
    if (/token_version FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    for (const [re, rows] of state.rows) if (re.test(sql)) return typeof rows === 'function' ? rows(params) : rows;
    return /^\s*(UPDATE|INSERT|DELETE)/i.test(sql) ? { affectedRows: 1 } : [];
  };
  return {
    query: vi.fn(run(false)),
    withTransaction: vi.fn(async (fn: any) => {
      const mark = state.log.length;
      try {
        return await fn({ query: run(true) });
      } catch (err) {
        // Model a rollback: statements from the failed transaction never "happened".
        state.log.push({ sql: 'ROLLBACK', params: [], tx: true });
        state.log.splice(mark, state.log.length - mark - 1);
        throw err;
      }
    }),
    getDbPool: vi.fn(),
  };
});

const home = await import('@/app/api/admin/simple/home/route');
const invoices = await import('@/app/api/admin/invoices/route');
const payments = await import('@/app/api/admin/simple/payments/route');
const dues = await import('@/app/api/admin/simple/dues/route');
const ordersRoute = await import('@/app/api/admin/simple/orders/route');
const eyeTests = await import('@/app/api/admin/simple/eye-tests/route');
const bookingsRoute = await import('@/app/api/admin/simple/bookings/route');
const customersRoute = await import('@/app/api/admin/simple/customers/route');
const stockRoute = await import('@/app/api/admin/simple/stock/route');
const purchases = await import('@/app/api/admin/purchases/route');
const moneyRoute = await import('@/app/api/admin/simple/money/route');
const reportRoute = await import('@/app/api/admin/simple/report/route');
const staffRoute = await import('@/app/api/admin/staff/route');
const settingsRoute = await import('@/app/api/admin/settings/route');
const bookingsAdmin = await import('@/app/api/admin/bookings/route');
const productsRoute = await import('@/app/api/admin/products/route');
const customerById = await import('@/app/api/admin/customers/[id]/route');
const invoiceById = await import('@/app/api/admin/invoices/[id]/route');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLES: Role[] = ['admin', 'manager', 'staff'];

function signInAs(role: Role | null) {
  if (!role) {
    state.cookie = undefined;
    state.user = null;
    return;
  }
  state.user = { id: 'u1', name: 'Anu', email: `${role}@d.com`, role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'Anu', email: `${role}@d.com`, ver: 0 });
}

const req = (method: string, body?: unknown, url = 'http://localhost/api/admin/simple/x') =>
  new Request(url, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  });

const written = (re: RegExp) => state.log.filter((l) => re.test(l.sql));
const audits = () => written(/INSERT INTO audit_logs/);

beforeEach(() => {
  state.log = [];
  state.rows = [];
  state.failOn = null;
  signInAs(null);
});

/** Every new endpoint with the roles allowed to reach it. */
const MATRIX: { name: string; allowed: Role[]; call: () => Promise<Response> }[] = [
  { name: 'GET /simple/home', allowed: ROLES, call: () => home.GET() },
  { name: 'GET /simple/orders', allowed: ROLES, call: () => ordersRoute.GET() },
  { name: 'POST /simple/orders', allowed: ROLES, call: () => ordersRoute.POST(req('POST', {})) },
  { name: 'GET /simple/dues', allowed: ROLES, call: () => dues.GET(req('GET')) },
  { name: 'POST /simple/payments', allowed: ROLES, call: () => payments.POST(req('POST', {})) },
  { name: 'POST /simple/eye-tests', allowed: ROLES, call: () => eyeTests.POST(req('POST', {})) },
  { name: 'GET /simple/bookings', allowed: ROLES, call: () => bookingsRoute.GET(req('GET')) },
  { name: 'POST /simple/bookings', allowed: ROLES, call: () => bookingsRoute.POST(req('POST', {})) },
  { name: 'GET /simple/customers', allowed: ROLES, call: () => customersRoute.GET(req('GET')) },
  { name: 'POST /simple/stock', allowed: ['admin', 'manager'], call: () => stockRoute.POST(req('POST', {})) },
  { name: 'GET /simple/money', allowed: ['admin', 'manager'], call: () => moneyRoute.GET(req('GET')) },
  { name: 'GET /simple/report', allowed: ['admin', 'manager'], call: () => reportRoute.GET(req('GET')) },
];

describe('simple admin endpoints require a session and the right role', () => {
  it.each(MATRIX)('$name rejects anonymous requests', async ({ call }) => {
    expect((await call()).status).toBe(401);
  });

  for (const entry of MATRIX) {
    for (const role of ROLES) {
      const ok = entry.allowed.includes(role);
      it(`${entry.name} ${ok ? 'allows' : 'denies'} ${role}`, async () => {
        signInAs(role);
        const status = (await entry.call()).status;
        if (ok) expect([401, 403]).not.toContain(status);
        else expect(status).toBe(403);
      });
    }
  }
});

// ─── Home ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/simple/home', () => {
  beforeEach(() => {
    state.rows = [
      [/order_status IN .* expected_date < \?/, [{ count: 3 }]],
      [/status = 'confirmed'/, [{ id: 7, name: 'Sneha Pillai', preferred_time: '04:00 PM' }]],
      [/status = 'pending'/, [{ count: 2 }]],
      [/NOTIFY_READY/, [{ count: 4 }]],
      [/stock <= low_stock_threshold/, [{ count: 5 }]],
      [/FROM inquiries WHERE status = 'new'/, [{ count: 2 }]],
      [/SUM\(total\)/, [{ total: '48250.00', count: 14 }]],
      [/FROM payments/, [{ total: '39800.00' }]],
      [/SUM\(balance\)/, [{ total: '126700.00', customers: 12 }]],
    ];
  });

  it('gives staff the attention list but no money figures at all', async () => {
    signInAs('staff');
    const body = await (await home.GET()).json();
    expect(body.attention).toEqual({
      late_orders: 3,
      arrived: [{ id: 7, name: 'Sneha Pillai', time: '04:00 PM' }],
      booked_today: 2,
      ready_not_told: 4,
      low_stock: 5,
      new_messages: 2,
    });
    expect(body.today).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/48250|39800|126700/);
    // Money queries must not even run for staff.
    expect(written(/FROM payments|SUM\(balance\)|SUM\(total\)/)).toHaveLength(0);
  });

  it.each(['manager', 'admin'] as const)('gives %s the money figures', async (role) => {
    signInAs(role);
    const body = await (await home.GET()).json();
    expect(body.today).toEqual({ sold: 48250, bills: 14, received: 39800, to_collect: 126700, owing_customers: 12 });
  });

  it('keeps cancelled bills out of the totals and uses parameters for dates', async () => {
    signInAs('admin');
    await home.GET();
    expect(written(/SUM\(total\)/)[0].sql).toMatch(/status <> 'cancelled'/);
    for (const l of state.log) expect(l.sql).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

// ─── New sale (uses the existing invoice route) ───────────────────────────────

describe('New sale saves through POST /api/admin/invoices', () => {
  const settings = { invoice_prefix: 'DO', tax_enabled: 1, tax_rate: '12.00', max_discount_admin: 100, max_discount_manager: 15, max_discount_staff: 5 };
  const products: Record<string, any> = {
    f1: { id: 'f1', product_code: 'FR-1', name: 'Titan rectangle', category: 'frame', selling_price: '2490.00', stock: 4, status: 'active' },
    l1: { id: 'l1', product_code: 'LN-1', name: 'Blue-cut lenses', category: 'lens', selling_price: '2100.00', stock: 10, status: 'active' },
  };

  beforeEach(() => {
    state.rows = [
      [/FROM products WHERE id=\? FOR UPDATE/, (p) => (products[p[0]] ? [products[p[0]]] : [])],
      [/FROM shop_settings/, [settings]],
      [/FROM invoices WHERE id/, [{ id: 'new', invoice_number: 'DO-2026-00001', total: '4883.76', paid: '4883.76', balance: '0.00' }]],
    ];
  });

  /** Exactly what the wizard sends for a frame + lenses sale. */
  const wizardBody = (over: Record<string, unknown> = {}) => ({
    customer_id: 'c1', customer_name: 'Priya Raman', customer_phone: '9840012345', eye_test_id: 't1',
    items: [
      { product_id: 'f1', product_name: 'x', product_code: 'x', category: 'frame', quantity: 1, unit_price: 1 },
      { product_id: 'l1', product_name: 'x', product_code: 'x', category: 'lens', quantity: 1, unit_price: 1 },
    ],
    discount_percent: 5, payment_method: 'upi', amount_paid: saleTotals([{ price: 2490, qty: 1 }, { price: 2100, qty: 1 }], 5, 12).total,
    has_order: true, expected_date: '2026-11-30', frame_product: 'Titan rectangle', lens_product: 'Blue-cut lenses',
    ...over,
  });

  const post = (body: unknown) => invoices.POST(req('POST', body, 'http://localhost/api/admin/invoices'));

  it('accepts the "Full amount" the screen shows, and prices from the database not the browser', async () => {
    signInAs('staff');
    const res = await post(wizardBody());
    expect(res.status).toBe(201);
    const insert = written(/INSERT INTO invoices/)[0];
    // subtotal, discount, …, total, paid, balance, status, order_status
    expect(insert.params.slice(6, 16)).toEqual([4590, 229.5, 5, 12, 523.26, 4883.76, 4883.76, 0, 'paid', 'new']);
  });

  it('does it all in one transaction: invoice, items, stock, payment and audit log', async () => {
    signInAs('staff');
    await post(wizardBody());
    const kinds = state.log.filter((l) => l.tx && /^\s*(INSERT|UPDATE)/i.test(l.sql)).map((l) => l.sql.match(/(?:INTO|UPDATE)\s+(\w+)/i)![1]);
    expect(kinds).toEqual(expect.arrayContaining(['invoices', 'invoice_items', 'products', 'stock_movements', 'payments', 'audit_logs']));
    expect(state.log.filter((l) => /INSERT INTO (invoices|invoice_items|payments|stock_movements|audit_logs)/.test(l.sql)).every((l) => l.tx)).toBe(true);
    expect(written(/'sale'/)).toHaveLength(2);
    expect(audits()).toHaveLength(1);
  });

  it('rejects a discount above the role ceiling even when the screen is bypassed', async () => {
    signInAs('staff');
    const res = await post(wizardBody({ discount_percent: 6, amount_paid: 0 }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/5% limit/);
    expect(written(/INSERT INTO invoices/)).toHaveLength(0);
  });

  it('lets a manager give up to their own ceiling', async () => {
    signInAs('manager');
    expect((await post(wizardBody({ discount_percent: 15, amount_paid: 0 }))).status).toBe(201);
    expect((await post(wizardBody({ discount_percent: 16, amount_paid: 0 }))).status).toBe(403);
  });

  it('rolls everything back when any part of the save fails', async () => {
    signInAs('staff');
    state.failOn = /INSERT INTO payments/;
    const res = await post(wizardBody());
    expect(res.status).toBe(400);
    expect(state.log.some((l) => l.sql === 'ROLLBACK')).toBe(true);
    expect(written(/INSERT INTO (invoices|invoice_items|stock_movements|audit_logs)/)).toHaveLength(0);
  });

  it('does not make a lab order for a sale with no lenses', async () => {
    signInAs('staff');
    await post(wizardBody({ items: [{ product_id: 'f1', product_name: 'x', product_code: 'x', category: 'frame', quantity: 1, unit_price: 1 }], has_order: false, amount_paid: 0, expected_date: null }));
    expect(written(/INSERT INTO invoices/)[0].params[15]).toBeNull();
  });
});

// ─── Take payment ─────────────────────────────────────────────────────────────

describe('POST /api/admin/simple/payments', () => {
  const bills = () => [
    { id: 'inv-old', invoice_number: 'DO-2026-00001', customer_name: 'Ravi', total: '3000.00', paid: '2000.00', balance: '1000.00' },
    { id: 'inv-new', invoice_number: 'DO-2026-00007', customer_name: 'Ravi', total: '5000.00', paid: '0.00', balance: '5000.00' },
  ];
  beforeEach(() => {
    state.rows = [[/FROM invoices[\s\S]*FOR UPDATE/, bills()]];
  });
  const pay = (body: unknown) => payments.POST(req('POST', body));

  it('locks the open bills and pays the oldest first', async () => {
    signInAs('staff');
    const res = await pay({ customer_id: 'c1', amount: 1500, method: 'upi' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ received: 1500, still_owed: 4500, invoices: ['DO-2026-00001', 'DO-2026-00007'], customer_name: 'Ravi' });
    expect(state.log.find((l) => /FROM invoices/.test(l.sql))!.sql).toMatch(/ORDER BY created_at ASC[\s\S]*FOR UPDATE/);
    const updates = written(/UPDATE invoices/).map((l) => l.params);
    expect(updates).toEqual([
      [3000, 0, 'paid', 'inv-old'],
      [500, 4500, 'partially_paid', 'inv-new'],
    ]);
    expect(written(/INSERT INTO payments/).map((l) => [l.params[1], l.params[2], l.params[3]])).toEqual([
      ['inv-old', 1000, 'upi'],
      ['inv-new', 500, 'upi'],
    ]);
    expect(audits()).toHaveLength(2);
    expect(state.log.filter((l) => /^\s*(UPDATE|INSERT)/.test(l.sql)).every((l) => l.tx)).toBe(true);
  });

  it('refuses to take more than the customer owes', async () => {
    signInAs('admin');
    const res = await pay({ customer_id: 'c1', amount: 6000.01, method: 'cash' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/more than they owe.*₹6,000/);
    expect(written(/INSERT INTO payments/)).toHaveLength(0);
  });

  it('says so when nothing is owed', async () => {
    signInAs('staff');
    state.rows = [[/FROM invoices[\s\S]*FOR UPDATE/, []]];
    expect((await pay({ customer_id: 'c1', amount: 10, method: 'cash' })).status).toBe(400);
  });

  it('validates the input', async () => {
    signInAs('staff');
    expect((await pay({ customer_id: 'c1', amount: -5, method: 'cash' })).status).toBe(400);
    expect((await pay({ customer_id: 'c1', amount: 5, method: 'cheque' })).status).toBe(400);
    expect((await pay({ amount: 5, method: 'cash' })).status).toBe(400);
  });

  it('rolls back every bill if one write fails', async () => {
    signInAs('staff');
    state.failOn = /INSERT INTO audit_logs/;
    expect((await pay({ customer_id: 'c1', amount: 1500, method: 'upi' })).status).toBe(400);
    expect(written(/UPDATE invoices|INSERT INTO payments/)).toHaveLength(0);
  });
});

describe('GET /api/admin/simple/dues', () => {
  it('lists balances per customer with the search as a parameter', async () => {
    signInAs('staff');
    state.rows = [[/GROUP BY customer_id/, [{ customer_id: 'c1', name: 'Ravi', phone: '9840012345', owed: '6000.00', bills: 2, since: '2026-10-01' }]]];
    const body = await (await dues.GET(req('GET', undefined, "http://localhost/api/admin/simple/dues?q=Ravi'%20OR%201=1"))).json();
    expect(body.dues[0]).toMatchObject({ customer_id: 'c1', owed: 6000, bills: 2 });
    const sql = state.log.find((l) => /GROUP BY/.test(l.sql))!;
    expect(sql.sql).not.toContain('Ravi');
    expect(sql.params).toContain("%Ravi' OR 1=1%");
    expect(sql.sql).toMatch(/status <> 'cancelled'/);
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────

describe('/api/admin/simple/orders', () => {
  it('reports whether each ready customer was told', async () => {
    signInAs('staff');
    state.rows = [
      [/order_status IN \('new','lens_ordered','in_process','ready'\)/, [
        { id: 'a', invoice_number: 'DO-1', customer_id: 'c1', customer_name: 'Sneha', customer_phone: '9841063327', lens_product: 'High-index', frame_product: null, order_status: 'ready', expected_date: '2026-11-25', balance: '0', told: 1 },
      ]],
      [/order_status = 'delivered'/, []],
    ];
    const body = await (await ordersRoute.GET()).json();
    expect(body.orders[0]).toMatchObject({ id: 'a', status: 'ready', told: true, item: 'High-index', expected_date: '2026-11-25' });
  });

  it('records the ready message for a ready order, with an audit entry', async () => {
    signInAs('staff');
    state.rows = [[/FROM invoices WHERE id = \?/, [{ id: 'a', invoice_number: 'DO-1', customer_name: 'Sneha', order_status: 'ready' }]]];
    expect((await ordersRoute.POST(req('POST', { invoice_id: 'a' }))).status).toBe(201);
    expect(audits()[0].params[1]).toBe('NOTIFY_READY');
  });

  it('refuses to mark an order that is not ready, or does not exist', async () => {
    signInAs('staff');
    state.rows = [[/FROM invoices WHERE id = \?/, [{ id: 'a', invoice_number: 'DO-1', customer_name: 'Sneha', order_status: 'in_process' }]]];
    expect((await ordersRoute.POST(req('POST', { invoice_id: 'a' }))).status).toBe(400);
    state.rows = [];
    expect((await ordersRoute.POST(req('POST', { invoice_id: 'zz' }))).status).toBe(404);
    expect(audits()).toHaveLength(0);
  });
});

// ─── Eye test ─────────────────────────────────────────────────────────────────

describe('POST /api/admin/simple/eye-tests', () => {
  const eye = (over: Record<string, unknown> = {}) => ({ sph: '-1.75', cyl: '-0.50', axis: '90', add: '', pd: '31.5', va: '6/6', ...over });
  const body = (over: Record<string, unknown> = {}) => ({ customer_id: 'c1', right: eye(), left: eye({ sph: '+2', cyl: '', axis: '' }), recommendation: 'single_vision', next_checkup: '2027-11-27', ...over });
  const save = (b: unknown) => eyeTests.POST(req('POST', b));

  beforeEach(() => {
    state.rows = [
      [/FROM customers WHERE id = \?/, [{ id: 'c1', name: 'Priya Raman', phone: '9840012345' }]],
      [/FROM appointments WHERE id = \? FOR UPDATE/, [{ id: 7 }]],
    ];
  });

  it('saves standard prescription text, with the name and phone from the database', async () => {
    signInAs('staff');
    const res = await save(body({ customer_name: 'Someone Else' }));
    expect(res.status).toBe(201);
    const p = written(/INSERT\s+INTO eye_tests/)[0].params;
    expect(p.slice(1, 4)).toEqual(['c1', 'Priya Raman', '9840012345']);
    expect(p.slice(6, 16)).toEqual(['-1.75', '-0.50', '90', null, '31.5', '+2.00', null, null, null, '31.5']);
    expect(p[18]).toBe('Single vision');
    expect(p[19]).toMatch(/Next check-up: .*2027/);
    expect(audits()).toHaveLength(1);
  });

  it.each([
    ['power beyond ±20', { right: eye({ sph: '-20.25' }) }, /between -20 and 20/],
    ['power not in 0.25 steps', { right: eye({ sph: '1.3' }) }, /steps of 0.25/],
    ['axis above 180', { right: eye({ axis: '200' }) }, /Axis must be between 0 and 180/],
    ['cylinder without axis', { left: eye({ axis: '' }) }, /Axis is needed/],
    ['unknown suggestion', { recommendation: 'magic' }, /recommendation/],
  ])('refuses %s', async (_name, over, message) => {
    signInAs('staff');
    const res = await save(body(over));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(message);
    expect(written(/INSERT\s+INTO eye_tests/)).toHaveLength(0);
  });

  it('closes the booking in the same transaction', async () => {
    signInAs('staff');
    expect((await save(body({ booking_id: 7 }))).status).toBe(201);
    const done = written(/UPDATE appointments SET status = 'completed'/);
    expect(done).toHaveLength(1);
    expect(done[0].tx).toBe(true);
    expect(audits()).toHaveLength(2);
  });

  it('rolls back the test when the booking does not exist', async () => {
    signInAs('staff');
    state.rows = [[/FROM customers WHERE id = \?/, [{ id: 'c1', name: 'Priya Raman', phone: '9840012345' }]]];
    const res = await save(body({ booking_id: 99 }));
    expect(res.status).toBe(404);
    expect(written(/INSERT\s+INTO eye_tests/)).toHaveLength(0);
  });

  it('404s for an unknown customer', async () => {
    signInAs('staff');
    state.rows = [];
    expect((await save(body())).status).toBe(404);
  });
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

describe('/api/admin/simple/bookings', () => {
  it('lists one day, with counts for the day tabs, using parameters', async () => {
    signInAs('staff');
    state.rows = [
      [/WHERE preferred_date = \?/, [{ id: 3, name: 'Sneha', phone: '9841063327', preferred_time: '04:00 PM', test_type: 'Eye Testing', status: 'confirmed' }]],
      [/GROUP BY preferred_date/, []],
    ];
    const body = await (await bookingsRoute.GET(req('GET', undefined, 'http://localhost/api/admin/simple/bookings?day=2099-01-02'))).json();
    expect(body.day).toBe('2099-01-02');
    expect(body.bookings).toEqual([{ id: 3, name: 'Sneha', phone: '9841063327', time: '04:00 PM', type: 'Eye Testing', status: 'confirmed' }]);
    expect(body.days).toHaveLength(3);
    expect(state.log.find((l) => /WHERE preferred_date = \?/.test(l.sql))!.params).toEqual(['2099-01-02']);
  });

  it('ignores a malformed day instead of putting it in SQL', async () => {
    signInAs('staff');
    await bookingsRoute.GET(req('GET', undefined, "http://localhost/api/admin/simple/bookings?day=1'%20OR%201=1"));
    expect(state.log.find((l) => /WHERE preferred_date = \?/.test(l.sql))!.params[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('adds a booking with an audit entry in one transaction', async () => {
    signInAs('staff');
    state.rows = [[/INSERT INTO appointments/, { insertId: 42 } as any]];
    const res = await bookingsRoute.POST(req('POST', { name: 'Ravi Kumar', phone: '97100 45098', day: '2099-01-02', time: '4:30 PM' }));
    expect(res.status).toBe(201);
    expect((await res.json()).booking).toMatchObject({ id: 42, time: '04:30 PM' });
    expect(written(/INSERT INTO appointments/)[0].tx).toBe(true);
    expect(audits()[0].params[3]).toBe('42');
  });

  it.each([
    ['a past day', { day: '2020-01-01' }],
    ['a bad time', { time: '25:00' }],
    ['a bad phone', { phone: 'call me' }],
    ['no name', { name: '' }],
  ])('refuses %s', async (_name, over) => {
    signInAs('staff');
    const res = await bookingsRoute.POST(req('POST', { name: 'Ravi Kumar', phone: '9710045098', day: '2099-01-02', time: '04:30 PM', ...over }));
    expect(res.status).toBe(400);
    expect(audits()).toHaveLength(0);
  });
});

// ─── Customers ────────────────────────────────────────────────────────────────

describe('GET /api/admin/simple/customers', () => {
  it('returns what each customer owes, excluding cancelled bills, searching by parameter', async () => {
    signInAs('staff');
    state.rows = [[/FROM customers c/, [{ id: 'c1', customer_id: 'DO-2026-001', name: 'Priya Raman', phone: '9840012345', last_visit: null, owed: '1200.50' }]]];
    const body = await (await customersRoute.GET(req('GET', undefined, 'http://localhost/api/admin/simple/customers?q=98400'))).json();
    expect(body.customers).toEqual([{ id: 'c1', customer_id: 'DO-2026-001', name: 'Priya Raman', phone: '9840012345', last_visit: null, owed: 1200.5 }]);
    const sql = state.log.find((l) => /FROM customers c/.test(l.sql))!;
    expect(sql.sql).toMatch(/status <> 'cancelled'/);
    expect(sql.params).toEqual(['%98400%', '%98400%', '%98400%']);
  });
});

// ─── Stock ────────────────────────────────────────────────────────────────────

describe('POST /api/admin/simple/stock', () => {
  const tapStock = (body: unknown) => stockRoute.POST(req('POST', body));
  beforeEach(() => {
    state.rows = [[/FROM products WHERE id = \? FOR UPDATE/, [{ id: 'p1', name: 'Aviator', product_code: 'FR-1', stock: 2, category: 'frame' }]]];
  });

  it('records a damaged item as a typed movement, with the count and audit in one transaction', async () => {
    signInAs('manager');
    const res = await tapStock({ product_id: 'p1', change: -1, reason: 'damaged' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ stock: 1 });
    expect(written(/UPDATE products SET stock = \?/)[0].params).toEqual([1, 'p1']);
    const mv = written(/INSERT INTO stock_movements/)[0];
    expect(mv.params.slice(4, 7)).toEqual(['damage', -1, 'Damaged or broken']);
    expect(state.log.filter((l) => /^\s*(UPDATE|INSERT)/.test(l.sql)).every((l) => l.tx)).toBe(true);
    expect(audits()).toHaveLength(1);
  });

  it('maps returns and recounts to their movement types', async () => {
    signInAs('admin');
    await tapStock({ product_id: 'p1', change: 1, reason: 'returned' });
    await tapStock({ product_id: 'p1', change: -1, reason: 'counted' });
    expect(written(/INSERT INTO stock_movements/).map((l) => l.params[4])).toEqual(['return', 'adjustment']);
  });

  it.each([
    ['damage that adds stock', { change: 1, reason: 'damaged' }],
    ['a return that removes stock', { change: -1, reason: 'returned' }],
    ['going below zero', { change: -3, reason: 'counted' }],
    ['a zero change', { change: 0, reason: 'counted' }],
  ])('refuses %s', async (_name, over) => {
    signInAs('admin');
    expect((await tapStock({ product_id: 'p1', ...over })).status).toBe(400);
    expect(written(/UPDATE products|INSERT INTO stock_movements/)).toHaveLength(0);
  });

  it('refuses services and unknown items', async () => {
    signInAs('admin');
    state.rows = [[/FOR UPDATE/, [{ id: 's1', name: 'Eye test', product_code: 'SV', stock: 0, category: 'service' }]]];
    expect((await tapStock({ product_id: 's1', change: 1, reason: 'counted' })).status).toBe(400);
    state.rows = [];
    expect((await tapStock({ product_id: 'zz', change: 1, reason: 'counted' })).status).toBe(404);
  });
});

describe('New stock arrived saves through POST /api/admin/purchases', () => {
  it('accepts "paid in full" when the bill total has floating-point dust (1.15 × 3)', async () => {
    signInAs('manager');
    state.rows = [[/FROM products WHERE id = \? FOR UPDATE/, [{ id: 'p1', name: 'Lens cloth', product_code: 'AC-1' }]]];
    const res = await purchases.POST(req('POST', {
      supplier_id: 's1', supplier_name: 'Essilor', items: [{ product_id: 'p1', quantity: 3, purchase_price: 1.15 }], amount_paid: 3.45,
    }));
    expect(res.status).toBe(201);
    const insert = written(/INSERT INTO purchases/)[0];
    expect(insert.params.slice(5, 9)).toEqual([3.45, 3.45, 0, 'paid']);
    expect(written(/'purchase'/)).toHaveLength(1);
    expect(audits()).toHaveLength(1);
  });

  it('rolls the whole delivery back if one item fails', async () => {
    signInAs('admin');
    state.rows = [[/FROM products WHERE id = \? FOR UPDATE/, (p) => (p[0] === 'p1' ? [{ id: 'p1', name: 'A', product_code: 'A' }] : [])]];
    const res = await purchases.POST(req('POST', {
      supplier_id: 's1', supplier_name: 'Essilor', items: [{ product_id: 'p1', quantity: 1, purchase_price: 10 }, { product_id: 'missing', quantity: 1, purchase_price: 10 }],
    }));
    expect(res.status).toBe(400);
    expect(written(/INSERT INTO (purchases|purchase_items|stock_movements|audit_logs)|UPDATE (products|suppliers)/)).toHaveLength(0);
  });
});

// ─── Money & monthly report ───────────────────────────────────────────────────

describe('GET /api/admin/simple/money', () => {
  it('computes money in, out and kept for the period, with parameterised dates', async () => {
    signInAs('manager');
    state.rows = [
      [/FROM payments/, [{ total: '39800.00' }]],
      [/FROM expenses/, [{ total: '12500.50' }]],
      [/GROUP BY customer_id/, [{ customer_id: 'c1', name: 'Ravi', phone: '9840012345', owed: '6000.00', since: '2026-10-01' }]],
    ];
    const body = await (await moneyRoute.GET(req('GET', undefined, 'http://localhost/api/admin/simple/money?period=week'))).json();
    expect(body).toMatchObject({ period: 'week', money_in: 39800, money_out: 12500.5, kept: 27299.5 });
    expect(body.owing[0]).toMatchObject({ customer_id: 'c1', owed: 6000 });
    const pay = state.log.find((l) => /FROM payments/.test(l.sql))!;
    expect(pay.params).toEqual([body.from, body.to]);
  });

  it('falls back to today for an unknown period', async () => {
    signInAs('admin');
    const body = await (await moneyRoute.GET(req('GET', undefined, "http://localhost/api/admin/simple/money?period=1'--"))).json();
    expect(body.period).toBe('today');
    expect(body.from).toBe(body.to);
  });
});

describe('GET /api/admin/simple/report', () => {
  beforeEach(() => {
    state.rows = [
      [/FROM invoices i WHERE/, (p) => [{ total: p[0] === '2026-10' ? '100000.00' : '120000.00', bills: 42 }]],
      [/SUM\(amount\),0\) AS total FROM expenses/, (p) => [{ total: p[0] === '2026-10' ? '20000.00' : '30000.00' }]],
      [/FROM invoice_items/, [{ category: 'lens', total: '70000.00' }, { category: 'frame', total: '50000.00' }]],
      [/GROUP BY category/, [{ category: 'rent', total: '25000.00' }]],
    ];
  });

  it('builds the month with change against the month before, excluding cancelled bills', async () => {
    signInAs('admin');
    const body = await (await reportRoute.GET(req('GET', undefined, 'http://localhost/api/admin/simple/report?month=2026-11'))).json();
    expect(body).toMatchObject({ month: '2026-11', sold: 120000, bills: 42, spent: 30000, kept: 90000, change: { sold: 20, kept: 13 } });
    expect(body.by_category[0]).toEqual({ category: 'lens', total: 70000 });
    for (const l of state.log.filter((x) => /FROM invoices i|JOIN invoices/.test(x.sql))) expect(l.sql).toMatch(/status <> 'cancelled'/);
  });

  it.each(["2026-11' OR 1=1", '2026-13', '2999-01'])('never puts a bad or future month (%s) in a query', async (month) => {
    signInAs('admin');
    const body = await (await reportRoute.GET(req('GET', undefined, `http://localhost/api/admin/simple/report?month=${encodeURIComponent(month)}`))).json();
    expect(body.month).toMatch(/^\d{4}-\d{2}$/);
    expect(body.month).not.toBe(month);
    for (const l of state.log) for (const p of l.params) expect(String(p)).not.toContain("'");
  });
});

// ─── Settings: the "Can see money" switch and discount limits ─────────────────

describe('Settings › Staff saves through the existing admin-only routes', () => {
  it('turning "Can see money" on or off bumps token_version so it applies at once', async () => {
    signInAs('admin');
    state.rows = [[/FROM users WHERE id=\? LIMIT 1/, [{ id: 'u2', name: 'Anu', role: 'staff', status: 'active' }]]];
    const res = await staffRoute.PUT(req('PUT', { id: 'u2', role: 'manager' }));
    expect(res.status).toBe(200);
    const update = written(/UPDATE users SET/)[0];
    expect(update.sql).toMatch(/token_version = token_version \+ 1/);
    expect(update.params).toContain('manager');
    expect(audits()).toHaveLength(1);
  });

  it.each(['manager', 'staff'] as const)('a %s cannot change roles or raise discount limits', async (role) => {
    signInAs(role);
    expect((await staffRoute.PUT(req('PUT', { id: 'u2', role: 'manager' }))).status).toBe(403);
    expect((await settingsRoute.PUT(req('PUT', { max_discount_staff: 100 }))).status).toBe(403);
    expect(written(/UPDATE (users|shop_settings)/)).toHaveLength(0);
  });
});


// ─── Daily jobs added to the simple admin (existing routes) ───────────────────

describe('Bookings › cancel and website messages', () => {
  beforeEach(() => {
    state.rows = [[/SELECT id FROM (appointments|inquiries) WHERE id = \?/, [{ id: 4 }]]];
  });

  it('cancels an eye-test booking with an audit entry', async () => {
    signInAs('staff');
    const res = await bookingsAdmin.PUT(req('PUT', { kind: 'appointment', id: 4, status: 'cancelled' }));
    expect(res.status).toBe(200);
    expect(written(/UPDATE appointments SET status = \?/)[0].params).toEqual(['cancelled', 4]);
    expect(audits()).toHaveLength(1);
  });

  it('marks a website message as replied', async () => {
    signInAs('staff');
    expect((await bookingsAdmin.PUT(req('PUT', { kind: 'inquiry', id: 4, status: 'contacted' }))).status).toBe(200);
    expect(written(/UPDATE inquiries SET status = \?/)[0].params).toEqual(['contacted', 4]);
  });

  it('refuses a booking status on a message', async () => {
    signInAs('staff');
    expect((await bookingsAdmin.PUT(req('PUT', { kind: 'inquiry', id: 4, status: 'cancelled' }))).status).toBe(400);
    expect(written(/UPDATE inquiries/)).toHaveLength(0);
  });
});

describe('Stock › new item', () => {
  const item = { name: 'Rectangle frame, black', brand: 'Titan', category: 'frame', selling_price: 2490, purchase_price: 1200, low_stock_threshold: 3, stock: 0 };

  it('is refused for front-desk staff', async () => {
    signInAs('staff');
    expect((await productsRoute.POST(req('POST', item))).status).toBe(403);
    expect(written(/INSERT INTO products/)).toHaveLength(0);
  });

  it('is saved for a manager, with an audit entry', async () => {
    signInAs('manager');
    const res = await productsRoute.POST(req('POST', item));
    expect(res.status).toBe(201);
    expect(written(/INSERT INTO products/)).toHaveLength(1);
    expect(audits().length).toBeGreaterThanOrEqual(1);
  });
});

describe('Customers › change details and remove', () => {
  const uuid = '1e47ac31-6fcb-4ca9-99cd-9477f16cab8f';
  const call = (method: 'PUT' | 'DELETE', body?: unknown) =>
    (method === 'PUT' ? customerById.PUT : customerById.DELETE)(req(method, body), { params: Promise.resolve({ id: uuid }) });

  beforeEach(() => {
    state.rows = [[/FROM customers WHERE id = \? OR customer_id = \?/, [{ id: uuid, customer_id: 'DO-2026-001', name: 'Priya Raman', phone: '9840012345', status: 'active' }]]];
  });

  it('lets staff fix a phone number, with an audit entry', async () => {
    signInAs('staff');
    const res = await call('PUT', { name: 'Priya Raman', phone: '9840099999', email: '', address: null, notes: null });
    expect(res.status).toBe(200);
    expect(written(/UPDATE customers SET name=\?/)[0].params).toContain('9840099999');
    expect(audits()).toHaveLength(1);
  });

  it('only lets the owner remove a customer (and keeps their records)', async () => {
    signInAs('manager');
    expect((await call('DELETE')).status).toBe(403);
    signInAs('admin');
    expect((await call('DELETE')).status).toBe(200);
    expect(written(/UPDATE customers SET status='inactive'/)).toHaveLength(1);
    expect(written(/DELETE FROM/)).toHaveLength(0);
  });
});

// ─── Billing and Products sections ────────────────────────────────────────────

describe('New sale › other amount and a bill note', () => {
  beforeEach(() => {
    state.rows = [
      [/FROM products WHERE id=\? FOR UPDATE/, [{ id: 'f1', product_code: 'FR-1', name: 'Titan', category: 'frame', selling_price: '1000.00', stock: 5, status: 'active' }]],
      [/FROM shop_settings/, [{ invoice_prefix: 'DO', tax_enabled: 0, tax_rate: 0, max_discount_staff: 5 }]],
    ];
  });
  const sale = (over: Record<string, unknown>) =>
    invoices.POST(req('POST', {
      customer_id: 'c1', customer_name: 'Ravi', customer_phone: '9840012345',
      items: [{ product_id: 'f1', product_name: 'x', product_code: 'x', category: 'frame', quantity: 2, unit_price: 1 }],
      payment_method: 'cash', has_order: false, ...over,
    }, 'http://localhost/api/admin/invoices'));

  it('saves part payment and the note', async () => {
    signInAs('staff');
    expect((await sale({ amount_paid: 750, notes: 'Fitting check next week' })).status).toBe(201);
    const p = written(/INSERT INTO invoices/)[0].params;
    expect(p.slice(11, 15)).toEqual([2000, 750, 1250, 'partially_paid']);
    expect(p[20]).toBe('Fitting check next week');
  });

  it('refuses more than the bill even if the screen is bypassed', async () => {
    signInAs('staff');
    expect((await sale({ amount_paid: 2000.01 })).status).toBe(400);
    expect(written(/INSERT INTO invoices/)).toHaveLength(0);
  });
});

describe('Products › full item details', () => {
  it('saves model, colour, size, material, MRP, photo and description', async () => {
    signInAs('admin');
    const res = await productsRoute.POST(req('POST', {
      name: 'Clubmaster', brand: 'Ray-Ban', category: 'frame', model: 'RB3016', color: 'Tortoise', size: '51-21-145',
      material: 'Acetate', selling_price: 8990, purchase_price: 5200, mrp: 9990, low_stock_threshold: 2, stock: 3,
      image_url: '/uploads/products/rb3016.webp', description: 'Classic browline',
    }));
    expect(res.status).toBe(201);
    const p = written(/INSERT INTO products/)[0].params;
    expect([p[4], p[6], p[7], p[8], p[11], p[12], p[14], p[15]]).toEqual(['RB3016', 'Tortoise', '51-21-145', 'Acetate', 9990, 3, '/uploads/products/rb3016.webp', 'Classic browline']);
  });
});

describe('Bills › cancel bill', () => {
  const uuid = '1e47ac31-6fcb-4ca9-99cd-9477f16cab8f';
  const cancel = () => invoiceById.PUT(req('PUT', { cancel: true }), { params: Promise.resolve({ id: uuid }) });
  beforeEach(() => {
    state.rows = [
      [/FROM invoices WHERE id = \? OR invoice_number = \?/, [{ id: uuid, invoice_number: 'DO-2026-00419', status: 'partially_paid' }]],
      [/FROM invoices WHERE id = \? FOR UPDATE/, [{ status: 'partially_paid', paid: '500.00', invoice_number: 'DO-2026-00419' }]],
      [/FROM payments WHERE invoice_id = \? AND amount > 0/, [{ amount: '500.00', method: 'upi' }]],
      [/FROM invoice_items/, [{ product_id: 'f1', product_name: 'Titan', product_code: 'FR-1', category: 'frame', quantity: 1 }]],
    ];
  });

  it('is not allowed for front-desk staff', async () => {
    signInAs('staff');
    expect((await cancel()).status).toBe(403);
    expect(written(/UPDATE invoices SET status='cancelled'/)).toHaveLength(0);
  });

  it('refunds what was paid and returns the stock, in one transaction, for a manager', async () => {
    signInAs('manager');
    expect((await cancel()).status).toBe(200);
    expect(written(/INSERT INTO payments/)[0].params[2]).toBe(-500);
    expect(written(/UPDATE products SET stock = stock \+ \?/)[0].params).toEqual([1, 'f1']);
    expect(written(/'return'/)).toHaveLength(1);
    expect(state.log.filter((l) => /UPDATE invoices SET status='cancelled'|INSERT INTO (payments|stock_movements|audit_logs)/.test(l.sql)).every((l) => l.tx)).toBe(true);
  });
});

describe('Settings › shop hours and logo', () => {
  const base = { id: 1, shop_name: 'Darshana Optical', phone: '1', email: 'a@b.co', address: 'x', city: 'Harur', state: 'TN', pincode: '636903', invoice_prefix: 'DO', customer_id_prefix: 'DO' };
  const put = (body: unknown) => settingsRoute.PUT(req('PUT', body));

  it('saves hours and logo once the columns exist', async () => {
    signInAs('admin');
    state.rows = [[/FROM shop_settings/, [{ ...base, opening_hours: null, logo_url: null }]]];
    expect((await put({ opening_hours: 'Mon–Sun 9:30–9', logo_url: '/uploads/logo.png' })).status).toBe(200);
    const u = written(/UPDATE shop_settings/)[0];
    expect(u.sql).toMatch(/opening_hours=\?,logo_url=\?/);
    expect(u.params.slice(-2)).toEqual(['Mon–Sun 9:30–9', '/uploads/logo.png']);
  });

  it('keeps saving other settings on a database without the new columns', async () => {
    signInAs('admin');
    state.rows = [[/FROM shop_settings/, [base]]];
    expect((await put({ shop_name: 'Darshana Optical Harur' })).status).toBe(200);
    expect(written(/UPDATE shop_settings/)[0].sql).not.toMatch(/opening_hours/);
    expect((await put({ opening_hours: 'Mon–Sun' })).status).toBe(409);
  });

  it.each(['javascript:alert(1)', 'data:image/png;base64,AAA', '//evil.example/x.png', 'http://insecure.example/x.png'])('refuses logo %s', async (logo_url) => {
    signInAs('admin');
    state.rows = [[/FROM shop_settings/, [{ ...base, logo_url: null }]]];
    expect((await put({ logo_url })).status).toBe(400);
  });
});
