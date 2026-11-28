import { beforeEach, describe, expect, it, vi } from 'vitest';

const opened: { end: ReturnType<typeof vi.fn> }[] = [];
vi.mock('mysql2/promise', () => ({
  default: {
    createConnection: vi.fn(async () => {
      const conn = { execute: vi.fn(async () => [[{ ok: 1 }]]), end: vi.fn(async () => {}) };
      opened.push(conn);
      return conn;
    }),
  },
}));

process.env.DATABASE_URL = 'mysql://user:pass@localhost:4000/db';
const { query, withDb } = await import('@/app/lib/db');

describe('one database connection per request', () => {
  beforeEach(() => {
    opened.length = 0;
  });

  it('shares a single connection across every query in a wrapped handler, then closes it', async () => {
    const handler = withDb(async () => {
      await query('SELECT 1');
      await Promise.all([query('SELECT 2'), query('SELECT 3')]);
      return 'done';
    });
    await expect(handler()).resolves.toBe('done');
    expect(opened).toHaveLength(1);
    expect(opened[0].end).toHaveBeenCalledTimes(1);
  });

  it('gives separate requests separate connections', async () => {
    const handler = withDb(async () => query('SELECT 1'));
    await Promise.all([handler(), handler()]);
    expect(opened).toHaveLength(2);
  });

  it('still closes the connection when the handler throws', async () => {
    const handler = withDb(async () => {
      await query('SELECT 1');
      throw new Error('boom');
    });
    await expect(handler()).rejects.toThrow('boom');
    expect(opened[0].end).toHaveBeenCalledTimes(1);
  });

  it('outside a handler, each query opens and closes its own connection', async () => {
    await query('SELECT 1');
    await query('SELECT 2');
    expect(opened).toHaveLength(2);
    expect(opened.every((c) => c.end.mock.calls.length === 1)).toBe(true);
  });
});
