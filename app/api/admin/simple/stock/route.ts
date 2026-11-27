import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { withTransaction } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { validate } from '@/app/lib/admin/validation';

// Why the count changed → the stock_movements type it is recorded as.
const REASONS = {
  damaged: { type: 'damage', words: 'Damaged or broken', direction: -1 },
  returned: { type: 'return', words: 'Returned by customer', direction: 1 },
  counted: { type: 'adjustment', words: 'Stock count correction', direction: 0 },
} as const;

const schema = z.object({
  product_id: z.string().trim().min(1).max(36),
  change: z.coerce.number().int().refine((n) => n !== 0 && Math.abs(n) <= 1000, 'change must be between -1000 and 1000 and not zero'),
  reason: z.enum(['damaged', 'returned', 'counted']),
  note: z.string().trim().max(500).optional().nullable(),
});

// POST /api/admin/simple/stock — the − / + buttons on the Stock screen.
//
// Management only, like the existing product stock adjustment. Each tap is one
// locked transaction: re-read the count, refuse to go below zero, then write
// the new count, a typed stock_movements row and an audit entry together.
export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;

  const parsed = validate(schema, await request.json().catch(() => null));
  if (parsed.error) return parsed.error;
  const { product_id, change, reason, note } = parsed.data;
  const rule = REASONS[reason];
  if (rule.direction !== 0 && Math.sign(change) !== rule.direction) {
    return NextResponse.json(
      { error: reason === 'damaged' ? 'Damaged items can only take stock down.' : 'Returned items can only add stock.' },
      { status: 400 },
    );
  }

  try {
    const stock = await withTransaction(async (tx) => {
      const [p] = (await tx.query('SELECT id, name, product_code, stock, category FROM products WHERE id = ? FOR UPDATE', [product_id])) as any[];
      if (!p) throw Object.assign(new Error('Item not found.'), { status: 404 });
      if (p.category === 'service') throw Object.assign(new Error('Services have no stock.'), { status: 400 });
      const next = Number(p.stock) + change;
      if (next < 0) throw Object.assign(new Error(`Only ${p.stock} in stock, so it can’t go below zero.`), { status: 400 });

      const why = note ? `${rule.words}: ${note}` : rule.words;
      await tx.query('UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?', [next, p.id]);
      await tx.query(
        `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,created_by)
         VALUES (?,?,?,?,?,?,?,?)`,
        [randomUUID(), p.id, p.name, p.product_code, rule.type, change, why, session.name],
      );
      await tx.query(
        'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
        [randomUUID(), 'STOCK', 'product', p.id, `${change > 0 ? '+' : ''}${change} ${p.name} (${why}) — now ${next}`, session.name, session.role],
      );
      return next;
    });
    return NextResponse.json({ stock }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'The stock could not be changed.' }, { status: err.status ?? 400 });
  }
}
