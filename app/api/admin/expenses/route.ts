import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { expenseCreateSchema, validate } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category') ?? 'all';

  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];
  if (from) { sql += ' AND expense_date >= ?'; params.push(from); }
  if (to) { sql += ' AND expense_date <= ?'; params.push(to); }
  if (category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY expense_date DESC, created_at DESC LIMIT 500';
  return NextResponse.json({ expenses: await query(sql, params) });
}

export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;

  const raw = await request.json();
  const parsed = validate(expenseCreateSchema, {
    ...raw,
    expense_date: raw.expense_date || raw.date,
    category: typeof raw.category === 'string' ? raw.category.toLowerCase() : 'other',
    payment_method: typeof raw.payment_method === 'string' ? raw.payment_method.toLowerCase() : 'cash',
  });
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const id = randomUUID();

  await withTransaction(async (tx) => {
    await tx.query(
      `INSERT INTO expenses (id,expense_date,category,amount,payment_method,description,reference,created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, b.expense_date, b.category, b.amount, b.payment_method,
       b.description, b.reference || null, session.name],
    );
    await tx.query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role)
       VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'CREATE', 'expense', id,
       `Expense ₹${b.amount} — ${b.category}: ${b.description}`, session.name, session.role],
    );
  });

  const [row] = await query('SELECT * FROM expenses WHERE id = ?', [id]) as any[];
  return NextResponse.json({ expense: row }, { status: 201 });
}
