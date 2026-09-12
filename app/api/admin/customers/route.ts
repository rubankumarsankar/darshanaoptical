import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

// GET /api/admin/customers
export async function GET(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? 'all';

  let sql = 'SELECT * FROM customers WHERE 1=1';
  const params: any[] = [];

  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (q) {
    sql += ' AND (name LIKE ? OR phone LIKE ? OR customer_id LIKE ? OR email LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT 500';

  const rows = await query(sql, params);
  return NextResponse.json({ customers: rows });
}

// POST /api/admin/customers
export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { name, phone, email, gender, dob, address, notes } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
  }

  // Generate customer_id: DO-YYYY-NNN
  const [countRow] = await query('SELECT COUNT(*) as cnt FROM customers') as any[];
  const year = new Date().getFullYear();
  const customer_id = `DO-${year}-${String(countRow.cnt + 1).padStart(3, '0')}`;

  const id = randomUUID();
  await query(
    `INSERT INTO customers (id, customer_id, name, phone, email, gender, dob, address, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [id, customer_id, name, phone, email || null, gender || null, dob || null, address || null, notes || null]
  );

  await query(
    `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
     VALUES (?, 'CREATE', 'customer', ?, ?, ?, ?)`,
    [randomUUID(), id, `Created customer: ${name} (${phone})`, session.name, session.role]
  );

  const [newCustomer] = await query('SELECT * FROM customers WHERE id = ?', [id]) as any[];
  return NextResponse.json({ customer: newCustomer }, { status: 201 });
}
