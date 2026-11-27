import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

// GET /api/admin/simple/dues?q=&customer=
//
// Customers who still owe money, largest balance first — the first step of
// "Take payment". Front-desk staff collect payments too, so this is open to
// every role; it lists per-customer balances only, never shop totals.
export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100);
  const customer = (searchParams.get('customer') ?? '').trim().slice(0, 36);

  let where = "balance > 0 AND status <> 'cancelled'";
  const params: any[] = [];
  if (customer) {
    where += ' AND customer_id = ?';
    params.push(customer);
  }
  if (q) {
    where += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR invoice_number LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const rows = (await query(
    `SELECT customer_id, MAX(customer_name) AS name, MAX(customer_phone) AS phone,
            SUM(balance) AS owed, COUNT(*) AS bills, MIN(created_at) AS since
       FROM invoices WHERE ${where}
      GROUP BY customer_id
      ORDER BY owed DESC
      LIMIT 100`,
    params,
  )) as any[];

  return NextResponse.json({
    dues: rows.map((r) => ({
      customer_id: r.customer_id,
      name: r.name,
      phone: r.phone,
      owed: Number(r.owed),
      bills: Number(r.bills),
      since: r.since,
    })),
  });
}
