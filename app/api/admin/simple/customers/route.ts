import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

// GET /api/admin/simple/customers?q=
//
// Customer search with what each person still owes, in one query, so the list
// can show "Owes ₹X" without a request per row. Active customers only, most
// recent visit first.
export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const q = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 100);
  const params: any[] = [];
  let where = "c.status = 'active'";
  if (q) {
    where += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.customer_id LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const rows = (await query(
    `SELECT c.id, c.customer_id, c.name, c.phone, c.last_visit, COALESCE(o.owed, 0) AS owed
       FROM customers c
       LEFT JOIN (
         SELECT customer_id, SUM(balance) AS owed FROM invoices
          WHERE balance > 0 AND status <> 'cancelled' GROUP BY customer_id
       ) o ON o.customer_id = c.id
      WHERE ${where}
      ORDER BY c.last_visit IS NULL, c.last_visit DESC, c.created_at DESC
      LIMIT 50`,
    params,
  )) as any[];

  return NextResponse.json({
    customers: rows.map((r) => ({
      id: r.id,
      customer_id: r.customer_id,
      name: r.name,
      phone: r.phone,
      last_visit: r.last_visit,
      owed: Number(r.owed ?? 0),
    })),
  });
}
