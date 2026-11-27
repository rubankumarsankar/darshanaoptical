import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { shopDate } from '@/app/lib/admin/date';
import { money, periodRange, type Period } from '@/app/lib/admin/simple';

const PERIODS: readonly Period[] = ['today', 'week', 'month'];

// GET /api/admin/simple/money?period=today|week|month — managers and admins.
//
// Money in = payments received in the period (refund rows are negative, so a
// cancelled sale nets out). Money out = expenses. You kept = in − out. Plus the
// customers who still owe, largest first.
export async function GET(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;

  const requested = new URL(request.url).searchParams.get('period') as Period | null;
  const period: Period = requested && PERIODS.includes(requested) ? requested : 'today';
  const { from, to } = periodRange(period, shopDate());

  const [[paidIn], [spent], owing] = await Promise.all([
    query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE DATE(CONVERT_TZ(payment_date,'+00:00','+05:30')) BETWEEN ? AND ?`, [from, to]) as Promise<any[]>,
    query('SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE expense_date BETWEEN ? AND ?', [from, to]) as Promise<any[]>,
    query(
      `SELECT customer_id, MAX(customer_name) AS name, MAX(customer_phone) AS phone, SUM(balance) AS owed, MIN(created_at) AS since
         FROM invoices WHERE balance > 0 AND status <> 'cancelled'
        GROUP BY customer_id ORDER BY owed DESC LIMIT 20`,
    ) as Promise<any[]>,
  ]);

  const moneyIn = money(Number(paidIn?.total ?? 0));
  const moneyOut = money(Number(spent?.total ?? 0));
  return NextResponse.json({
    period,
    from,
    to,
    money_in: moneyIn,
    money_out: moneyOut,
    kept: money(moneyIn - moneyOut),
    owing: (owing as any[]).map((r) => ({ customer_id: r.customer_id, name: r.name, phone: r.phone, owed: Number(r.owed), since: r.since })),
  });
}
