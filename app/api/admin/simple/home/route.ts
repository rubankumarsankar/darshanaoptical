import { NextResponse } from 'next/server';
import { query, withDb } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { shopDate, shopDayUtcRange } from '@/app/lib/admin/date';
import { canSeeMoney } from '@/app/lib/admin/simple';

// Orders still with the lab (not ready, delivered or cancelled).
const AT_LAB = "('new','lens_ordered','in_process')";

// GET /api/admin/simple/home
//
// Everything the Home screen needs in one call. Money figures are only built
// for managers and admins: staff responses don't contain them at all, so
// hiding them is not just a front-end choice.
async function GETHandler() {
  const { session, error } = await requireSession();
  if (error) return error;

  const today = shopDate();

  // One round trip for all the counts, one for today's bookings, run on the request's shared connection.
  const [[counts], arrived] = await Promise.all([
    query(
      `SELECT
         (SELECT COUNT(*) FROM invoices WHERE order_status IN ${AT_LAB} AND expected_date IS NOT NULL AND expected_date < ?) AS late,
         (SELECT COUNT(*) FROM appointments WHERE preferred_date = ? AND status = 'pending') AS booked,
         -- Ready orders nobody has sent the "your glasses are ready" message for.
         (SELECT COUNT(*) FROM invoices i WHERE i.order_status = 'ready'
            AND NOT EXISTS (SELECT 1 FROM audit_logs a WHERE a.entity = 'invoice' AND a.entity_id = i.id AND a.action = 'NOTIFY_READY')) AS ready,
         (SELECT COUNT(*) FROM products WHERE status = 'active' AND category <> 'service' AND stock <= low_stock_threshold) AS low,
         -- Contact-page messages nobody has replied to yet.
         (SELECT COUNT(*) FROM inquiries WHERE status = 'new') AS messages`,
      [today, today],
    ) as Promise<any[]>,
    // "Arrived" bookings (status confirmed) for today, earliest first.
    query(
      `SELECT id, name, preferred_time FROM appointments
        WHERE preferred_date = ? AND status = 'confirmed'
        ORDER BY STR_TO_DATE(preferred_time, '%h:%i %p') ASC LIMIT 3`,
      [today],
    ) as Promise<any[]>,
  ]);
  const late = { count: counts?.late };
  const booked = { count: counts?.booked };
  const ready = { count: counts?.ready };
  const low = { count: counts?.low };
  const messages = { count: counts?.messages };

  const attention = {
    late_orders: Number(late?.count ?? 0),
    arrived: (arrived as any[]).map((a) => ({ id: Number(a.id), name: String(a.name), time: a.preferred_time ?? null })),
    booked_today: Number(booked?.count ?? 0),
    ready_not_told: Number(ready?.count ?? 0),
    low_stock: Number(low?.count ?? 0),
    new_messages: Number(messages?.count ?? 0),
  };

  if (!canSeeMoney(session.role)) return NextResponse.json({ attention });

  // Today's money in one round trip. Date filters are UTC ranges so the created_at index is used.
  const [dayStart, dayEnd] = shopDayUtcRange(today);
  const [money] = (await query(
    `SELECT
       (SELECT COALESCE(SUM(total),0) FROM invoices WHERE created_at >= ? AND created_at < ? AND status <> 'cancelled') AS sold,
       (SELECT COUNT(*) FROM invoices WHERE created_at >= ? AND created_at < ? AND status <> 'cancelled') AS bills,
       -- Refund rows are negative, so a cancelled sale nets out of money received.
       (SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_date >= ? AND payment_date < ?) AS received,
       (SELECT COALESCE(SUM(balance),0) FROM invoices WHERE balance > 0 AND status <> 'cancelled') AS owed,
       (SELECT COUNT(DISTINCT customer_id) FROM invoices WHERE balance > 0 AND status <> 'cancelled') AS owing_customers`,
    [dayStart, dayEnd, dayStart, dayEnd, dayStart, dayEnd],
  )) as any[];
  const sold = { total: money?.sold, count: money?.bills };
  const received = { total: money?.received };
  const owed = { total: money?.owed, customers: money?.owing_customers };

  return NextResponse.json({
    attention,
    today: {
      sold: Number(sold?.total ?? 0),
      bills: Number(sold?.count ?? 0),
      received: Number(received?.total ?? 0),
      to_collect: Number(owed?.total ?? 0),
      owing_customers: Number(owed?.customers ?? 0),
    },
  });
}

export const GET = withDb(GETHandler);
