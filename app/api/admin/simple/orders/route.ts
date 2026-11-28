import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { query, withDb } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate } from '@/app/lib/admin/validation';

// GET /api/admin/simple/orders
//
// Orders split the way the shop thinks about them: at the lab (new,
// lens_ordered, in_process), ready for pickup, and recently handed over. Each
// ready order says whether the customer has been told; that is recorded as a
// NOTIFY_READY audit entry rather than a new column, so no schema change.
async function GETHandler() {
  const { error } = await requireSession();
  if (error) return error;

  const [open, handed] = await Promise.all([
    query(
      `SELECT i.id, i.invoice_number, i.customer_id, i.customer_name, i.customer_phone, i.frame_product, i.lens_product,
              i.order_status, i.expected_date, i.balance, i.updated_at,
              EXISTS (SELECT 1 FROM audit_logs a WHERE a.entity = 'invoice' AND a.entity_id = i.id AND a.action = 'NOTIFY_READY') AS told
         FROM invoices i
        WHERE i.order_status IN ('new','lens_ordered','in_process','ready')
        ORDER BY i.expected_date IS NULL, i.expected_date ASC, i.created_at ASC
        LIMIT 300`,
    ),
    query(
      `SELECT id, invoice_number, customer_id, customer_name, customer_phone, frame_product, lens_product,
              order_status, expected_date, balance, delivered_at
         FROM invoices WHERE order_status = 'delivered'
        ORDER BY delivered_at DESC LIMIT 30`,
    ),
  ]);

  const shape = (r: any) => ({
    id: r.id,
    invoice_number: r.invoice_number,
    customer_id: r.customer_id,
    name: r.customer_name,
    phone: r.customer_phone,
    item: [r.lens_product, r.frame_product].filter(Boolean).join(' + ') || 'Glasses',
    status: r.order_status,
    expected_date: r.expected_date ? String(r.expected_date instanceof Date ? r.expected_date.toISOString() : r.expected_date).slice(0, 10) : null,
    balance: Number(r.balance ?? 0),
    told: Boolean(Number(r.told ?? 0)),
    since: r.delivered_at ?? r.updated_at ?? null,
  });

  return NextResponse.json({ orders: [...(open as any[]), ...(handed as any[])].map(shape) });
}

const notifySchema = z.object({ invoice_id: z.string().trim().min(1).max(36) });

// POST /api/admin/simple/orders — record that the "glasses are ready" WhatsApp
// message was sent, so Home stops asking.
async function POSTHandler(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const parsed = validate(notifySchema, await request.json().catch(() => null));
  if (parsed.error) return parsed.error;

  const [order] = (await query("SELECT id, invoice_number, customer_name, order_status FROM invoices WHERE id = ? LIMIT 1", [parsed.data.invoice_id])) as any[];
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.order_status !== 'ready') return NextResponse.json({ error: 'Only ready orders can be marked as told.' }, { status: 400 });

  await query(
    'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
    [randomUUID(), 'NOTIFY_READY', 'invoice', order.id, `Told ${order.customer_name} that order ${order.invoice_number} is ready`, session.name, session.role],
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}

export const GET = withDb(GETHandler);
export const POST = withDb(POSTHandler);
