import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionToken } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: '' as string,
  user: null as any,
  txLog: [] as Array<{ sql: string; params: any[] }>,
  products: new Map<string, any>(),
  counter: 0,
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => state.cookie ? { name: 'darshana_session', value: state.cookie } : undefined }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string) => {
    if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    if (/SELECT \* FROM (products|expenses|purchases) WHERE id/.test(sql)) return [{}];
    return [];
  }),
  withTransaction: vi.fn(async (fn: any) => fn({
    query: async (sql: string, params: any[] = []) => {
      state.txLog.push({ sql, params });
      if (/FROM counters/.test(sql)) return [{ value: state.counter }];
      if (/UPDATE counters/.test(sql)) { state.counter = Number(params[0]); return {}; }
      if (/FROM products WHERE id = \? FOR UPDATE/.test(sql)) {
        const product = state.products.get(params[0]);
        return product ? [product] : [];
      }
      return [];
    },
  })),
  getDbPool: vi.fn(),
}));

const products = await import('@/app/api/admin/products/route');
const expenses = await import('@/app/api/admin/expenses/route');
const purchases = await import('@/app/api/admin/purchases/route');

const post = (route: any, body: unknown) => route.POST(new Request('http://localhost/api/admin/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}));

beforeEach(() => {
  state.user = { id: 'u1', name: 'Admin', email: 'admin@d.com', role: 'admin', status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', name: 'Admin', email: 'admin@d.com', role: 'admin', ver: 0 });
  state.txLog = [];
  state.products = new Map([['p1', { id: 'p1', name: 'Trusted Frame', product_code: 'FR-1' }]]);
  state.counter = 0;
});

describe('product creation', () => {
  it('rejects malformed numeric data before starting a transaction', async () => {
    const response = await post(products, { name: 'Frame', brand: 'D', category: 'frame', stock: 1.5 });
    expect(response.status).toBe(400);
    expect(state.txLog).toEqual([]);
  });

  it('writes the product and audit record in one transaction', async () => {
    const response = await post(products, { name: 'Frame', brand: 'D', category: 'frames', stock: 2 });
    expect(response.status).toBe(201);
    expect(state.txLog.some((call) => /INSERT INTO products/.test(call.sql))).toBe(true);
    expect(state.txLog.some((call) => /INSERT INTO audit_logs/.test(call.sql))).toBe(true);
  });
});

describe('expense creation', () => {
  it('rejects a malformed amount before starting a transaction', async () => {
    const response = await post(expenses, {
      expense_date: '2026-11-02', category: 'supplies', amount: 'not-money',
      payment_method: 'cash', description: 'Stock',
    });
    expect(response.status).toBe(400);
    expect(state.txLog).toEqual([]);
  });

  it('writes the expense and audit record in one transaction', async () => {
    const response = await post(expenses, {
      expense_date: '2026-11-02', category: 'supplies', amount: '25.50',
      payment_method: 'upi', description: 'Cleaning cloths',
    });
    expect(response.status).toBe(201);
    expect(state.txLog.some((call) => /INSERT INTO expenses/.test(call.sql))).toBe(true);
    expect(state.txLog.some((call) => /INSERT INTO audit_logs/.test(call.sql))).toBe(true);
  });
});

describe('purchase product integrity', () => {
  const body = (productId: string) => ({
    supplier_id: 's1', supplier_name: 'Supplier',
    items: [{ product_id: productId, product_name: 'Forged Name', product_code: 'FAKE', quantity: 2, purchase_price: 50 }],
  });

  it('rejects an unknown product without inserting an orphan item', async () => {
    const response = await post(purchases, body('missing'));
    expect(response.status).toBe(400);
    expect(state.txLog.some((call) => /INSERT INTO purchase_items/.test(call.sql))).toBe(false);
  });

  it('uses authoritative product identity from the locked catalogue row', async () => {
    const response = await post(purchases, body('p1'));
    expect(response.status).toBe(201);
    const itemInsert = state.txLog.find((call) => /INSERT INTO purchase_items/.test(call.sql));
    expect(itemInsert?.params).toContain('Trusted Frame');
    expect(itemInsert?.params).toContain('FR-1');
    expect(itemInsert?.params).not.toContain('Forged Name');
  });
});
