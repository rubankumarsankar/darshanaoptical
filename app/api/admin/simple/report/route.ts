import { NextResponse } from 'next/server';
import { query, withDb } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { shopDate } from '@/app/lib/admin/date';
import { money, percentChange, previousMonth } from '@/app/lib/admin/simple';

const IST_MONTH = "DATE_FORMAT(CONVERT_TZ(i.created_at,'+00:00','+05:30'),'%Y-%m')";

// GET /api/admin/simple/report?month=YYYY-MM — managers and admins.
//
// One month in plain numbers: what was sold (cancelled bills excluded, as in
// the existing reports), what was spent, what was kept, the change against the
// month before, and both broken down by category.
async function GETHandler(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;

  const current = shopDate().slice(0, 7);
  const requested = new URL(request.url).searchParams.get('month') ?? current;
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested) && requested <= current ? requested : current;
  const before = previousMonth(month);

  const sales = (m: string) =>
    query(`SELECT COALESCE(SUM(i.total),0) AS total, COUNT(*) AS bills FROM invoices i WHERE ${IST_MONTH} = ? AND i.status <> 'cancelled'`, [m]) as Promise<any[]>;
  const spent = (m: string) => query("SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE DATE_FORMAT(expense_date,'%Y-%m') = ?", [m]) as Promise<any[]>;

  const [[sold], [soldBefore], [out], [outBefore], byCategory, byExpense, byStatus] = await Promise.all([
    sales(month),
    sales(before),
    spent(month),
    spent(before),
    query(
      `SELECT ii.category, COALESCE(SUM(ii.total),0) AS total
         FROM invoice_items ii JOIN invoices i ON i.id = ii.invoice_id
        WHERE ${IST_MONTH} = ? AND i.status <> 'cancelled'
        GROUP BY ii.category ORDER BY total DESC`,
      [month],
    ) as Promise<any[]>,
    query(
      "SELECT category, COALESCE(SUM(amount),0) AS total FROM expenses WHERE DATE_FORMAT(expense_date,'%Y-%m') = ? GROUP BY category ORDER BY total DESC",
      [month],
    ) as Promise<any[]>,
    // How many bills were paid, part paid, unpaid or cancelled this month.
    query(`SELECT i.status, COUNT(*) AS count FROM invoices i WHERE ${IST_MONTH} = ? GROUP BY i.status`, [month]) as Promise<any[]>,
  ]);

  const soldNow = money(Number(sold?.total ?? 0));
  const spentNow = money(Number(out?.total ?? 0));
  const keptNow = money(soldNow - spentNow);
  const keptBefore = money(Number(soldBefore?.total ?? 0) - Number(outBefore?.total ?? 0));

  return NextResponse.json({
    month,
    sold: soldNow,
    bills: Number(sold?.bills ?? 0),
    spent: spentNow,
    kept: keptNow,
    change: {
      sold: percentChange(soldNow, Number(soldBefore?.total ?? 0)),
      kept: percentChange(keptNow, keptBefore),
    },
    by_category: (byCategory as any[]).map((r) => ({ category: r.category, total: money(Number(r.total)) })),
    by_expense: (byExpense as any[]).map((r) => ({ category: r.category, total: money(Number(r.total)) })),
    by_status: Object.fromEntries((byStatus as any[]).map((r) => [r.status, Number(r.count)])),
  });
}

export const GET = withDb(GETHandler);
