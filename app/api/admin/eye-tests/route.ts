import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { eyeTestCreateSchema, validate } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const q = searchParams.get('q') ?? '';

  let sql = 'SELECT * FROM eye_tests WHERE 1=1';
  const params: any[] = [];

  if (customerId) { sql += ' AND customer_id = ?'; params.push(customerId); }
  if (q) {
    sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }
  sql += ' ORDER BY test_date DESC, created_at DESC LIMIT 500';

  const rows = await query(sql, params);
  return NextResponse.json({ eyeTests: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const raw = await request.json();
  const parsed = validate(eyeTestCreateSchema, {
    ...raw,
    re_sph: raw.re_sph ?? raw.right_eye?.sph,
    re_cyl: raw.re_cyl ?? raw.right_eye?.cyl,
    re_axis: raw.re_axis ?? raw.right_eye?.axis,
    re_add: raw.re_add ?? raw.right_eye?.add,
    re_pd: raw.re_pd ?? raw.right_eye?.pd,
    le_sph: raw.le_sph ?? raw.left_eye?.sph,
    le_cyl: raw.le_cyl ?? raw.left_eye?.cyl,
    le_axis: raw.le_axis ?? raw.left_eye?.axis,
    le_add: raw.le_add ?? raw.left_eye?.add,
    le_pd: raw.le_pd ?? raw.left_eye?.pd,
    visual_acuity_right: raw.visual_acuity_right ?? raw.va_right,
    visual_acuity_left: raw.visual_acuity_left ?? raw.va_left,
  });
  if (parsed.error) return parsed.error;
  const body = parsed.data;
  const { customer_id, customer_name, customer_phone, test_date } = body;
  const tested_by = body.tested_by ?? session.name;

  const id = randomUUID();
  await withTransaction(async (tx) => {
    await tx.query(
      `INSERT INTO eye_tests
       (id, customer_id, customer_name, customer_phone, test_date, tested_by,
        re_sph, re_cyl, re_axis, re_add, re_pd,
        le_sph, le_cyl, le_axis, le_add, le_pd,
        visual_acuity_right, visual_acuity_left, recommendation, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, customer_id, customer_name, customer_phone, test_date, tested_by,
       body.re_sph||null, body.re_cyl||null, body.re_axis||null, body.re_add||null, body.re_pd||null,
       body.le_sph||null, body.le_cyl||null, body.le_axis||null, body.le_add||null, body.le_pd||null,
       body.visual_acuity_right||null, body.visual_acuity_left||null,
       body.recommendation||null, body.notes||null]
    );
    await tx.query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [customer_id]);
    await tx.query(
      `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
     VALUES (?, 'CREATE', 'eye_test', ?, ?, ?, ?)`,
      [randomUUID(), id, `New eye test for: ${customer_name}`, session.name, session.role]
    );
  });

  const [row] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  return NextResponse.json({ eyeTest: row }, { status: 201 });
}
