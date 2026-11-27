import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { shopDate } from '@/app/lib/admin/date';
import { insertEyeTest } from '@/app/lib/admin/eye-tests';
import { simpleEyeTestSchema, validate } from '@/app/lib/admin/validation';
import { longDate } from '@/app/lib/admin/simple';

const RECOMMENDATION_TEXT: Record<string, string> = {
  single_vision: 'Single vision',
  progressive: 'Progressive',
  bifocal: 'Bifocal',
  contact_lenses: 'Contact lenses',
  no_change: 'No change',
};

// POST /api/admin/simple/eye-tests
//
// The simple admin's eye test: strict optical ranges (see simpleEyeTestSchema),
// the customer's name and phone read from the database rather than the
// browser, and — when the test came from a booking — that booking marked
// completed in the same transaction.
export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const parsed = validate(simpleEyeTestSchema, await request.json().catch(() => null));
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  const [customer] = (await query('SELECT id, name, phone FROM customers WHERE id = ? LIMIT 1', [b.customer_id])) as any[];
  if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

  const notes = [b.note?.trim(), b.next_checkup ? `Next check-up: ${longDate(b.next_checkup)} (${b.next_checkup})` : '']
    .filter(Boolean)
    .join('\n');

  try {
    const id = await withTransaction(async (tx) => {
      const testId = await insertEyeTest(tx, session, {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        test_date: shopDate(),
        tested_by: session.name,
        re_sph: b.right.sph, re_cyl: b.right.cyl, re_axis: b.right.axis, re_add: b.right.add, re_pd: b.right.pd,
        le_sph: b.left.sph, le_cyl: b.left.cyl, le_axis: b.left.axis, le_add: b.left.add, le_pd: b.left.pd,
        visual_acuity_right: b.right.va ?? null,
        visual_acuity_left: b.left.va ?? null,
        recommendation: b.recommendation ? RECOMMENDATION_TEXT[b.recommendation] : null,
        notes: notes || null,
      });
      if (b.booking_id) {
        const [booking] = (await tx.query('SELECT id FROM appointments WHERE id = ? FOR UPDATE', [b.booking_id])) as any[];
        if (!booking) throw Object.assign(new Error('Booking not found.'), { status: 404 });
        await tx.query("UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = ?", [b.booking_id]);
        await tx.query(
          'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
          [randomUUID(), 'UPDATE', 'appointment', String(b.booking_id), `Marked appointment #${b.booking_id} as completed (eye test done)`, session.name, session.role],
        );
      }
      return testId;
    });
    const [row] = (await query('SELECT * FROM eye_tests WHERE id = ?', [id])) as any[];
    return NextResponse.json({ eyeTest: row ?? { id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'The eye test could not be saved.' }, { status: err.status ?? 400 });
  }
}
