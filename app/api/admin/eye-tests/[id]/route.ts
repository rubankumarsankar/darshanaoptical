import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { eyeTestUpdateSchema, validate } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [row] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ eyeTest: row });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [existing] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const parsed = validate(eyeTestUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  await withTransaction(async (tx) => {
    await tx.query(
      `UPDATE eye_tests SET test_date=?, tested_by=?,
     re_sph=?, re_cyl=?, re_axis=?, re_add=?, re_pd=?,
     le_sph=?, le_cyl=?, le_axis=?, le_add=?, le_pd=?,
     visual_acuity_right=?, visual_acuity_left=?, recommendation=?, notes=?
     WHERE id=?`,
    [b.test_date ?? existing.test_date, b.tested_by ?? existing.tested_by,
     b.re_sph ?? existing.re_sph, b.re_cyl ?? existing.re_cyl, b.re_axis ?? existing.re_axis, b.re_add ?? existing.re_add, b.re_pd ?? existing.re_pd,
     b.le_sph ?? existing.le_sph, b.le_cyl ?? existing.le_cyl, b.le_axis ?? existing.le_axis, b.le_add ?? existing.le_add, b.le_pd ?? existing.le_pd,
     b.visual_acuity_right ?? existing.visual_acuity_right, b.visual_acuity_left ?? existing.visual_acuity_left,
     b.recommendation ?? existing.recommendation, b.notes ?? existing.notes,
     id]
    );
    await tx.query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'UPDATE', 'eye_test', id, `Updated eye test`, session.name, session.role]
    );
  });
  const [updated] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  return NextResponse.json({ eyeTest: updated });
}
