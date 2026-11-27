import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { shopDate } from '@/app/lib/admin/date';
import { canSeeMoney } from '@/app/lib/admin/simple';

// Orders still with the lab (not ready, delivered or cancelled).
const AT_LAB = "('new','lens_ordered','in_process')";
const IST = "CONVERT_TZ(created_at,'+00:00','+05:30')";

// GET /api/admin/simple/home
//
// Everything the Home screen needs in one call. Money figures are only built
// for managers and admins: staff responses don't contain them at all, so
// hiding them is not just a front-end choice.
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const today = shopDate();

  const [[late], arrived, [booked], [ready], [low], [messages]] = await Promise.all([
    query(`SELECT COUNT(*) AS count FROM invoices WHERE order_status IN ${AT_LAB} AND expected_date IS NOT NULL AND expected_date < ?`, [today]) as Promise<any[]>,
    // "Arrived" bookings (status confirmed) for today, earliest first.
    query(
      `SELECT id, name, preferred_time FROM appointments
        WHERE preferred_date = ? AND status = 'confirmed'
        ORDER BY STR_TO_DATE(preferred_time, '%h:%i %p') ASC LIMIT 3`,
      [today],
    ) as Promise<any[]>,
    query(`SELECT COUNT(*) AS count FROM appointments WHERE preferred_date = ? AND status = 'pending'`, [today]) as Promise<any[]>,
    // Ready orders nobody has sent the "your glasses are ready" message for.
    query(
      `SELECT COUNT(*) AS count FROM invoices i
        WHERE i.order_status = 'ready'
          AND NOT EXISTS (SELECT 1 FROM audit_logs a WHERE a.entity = 'invoice' AND a.entity_id = i.id AND a.action = 'NOTIFY_READY')`,
    ) as Promise<any[]>,
    query(`SELECT COUNT(*) AS count FROM products WHERE status = 'active' AND category <> 'service' AND stock <= low_stock_threshold`) as Promise<any[]>,
    // Contact-page messages nobody has replied to yet.
    query(`SELECT COUNT(*) AS count FROM inquiries WHERE status = 'new'`) as Promise<any[]>,
  ]);

  const attention = {
    late_orders: Number(late?.count ?? 0),
    arrived: (arrived as any[]).map((a) => ({ id: Number(a.id), name: String(a.name), time: a.preferred_time ?? null })),
    booked_today: Number(booked?.count ?? 0),
    ready_not_told: Number(ready?.count ?? 0),
    low_stock: Number(low?.count ?? 0),
    new_messages: Number(messages?.count ?? 0),
  };

  if (!canSeeMoney(session.role)) return NextResponse.json({ attention });

  const [[sold], [received], [owed]] = await Promise.all([
    query(`SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS count FROM invoices WHERE DATE(${IST}) = ? AND status <> 'cancelled'`, [today]) as Promise<any[]>,
    // Refund rows are negative, so a cancelled sale nets out of money received.
    query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE DATE(CONVERT_TZ(payment_date,'+00:00','+05:30')) = ?`, [today]) as Promise<any[]>,
    query(`SELECT COALESCE(SUM(balance),0) AS total, COUNT(DISTINCT customer_id) AS customers FROM invoices WHERE balance > 0 AND status <> 'cancelled'`) as Promise<any[]>,
  ]);

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
