import { NextResponse } from 'next/server';
import { query, withTransaction, withDb } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { eyeTestCreateSchema, validate } from '@/app/lib/admin/validation';
import { insertEyeTest } from '@/app/lib/admin/eye-tests';

async function GETHandler(request: Request) {
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

async function POSTHandler(request: Request) {
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

  const id = await withTransaction((tx) =>
    insertEyeTest(tx, session, { ...body, customer_id, customer_name, customer_phone, test_date, tested_by }),
  );

  const [row] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  return NextResponse.json({ eyeTest: row }, { status: 201 });
}

export const GET = withDb(GETHandler);
export const POST = withDb(POSTHandler);
