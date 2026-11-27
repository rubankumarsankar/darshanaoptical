import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { shopDate } from '@/app/lib/admin/date';
import { validate } from '@/app/lib/admin/validation';
import { shopDay } from '@/app/lib/admin/simple';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/admin/simple/bookings?day=YYYY-MM-DD
//
// Eye-test bookings for one day (website bookings included, since they land in
// the same table), plus how many are booked on each of the next three days for
// the day tabs. Signed-in staff only — unlike the public form's x-admin-secret GET.
export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const today = shopDate();
  const requested = searchParams.get('day') ?? today;
  const day = DATE.test(requested) ? requested : today;
  const days = [shopDay(0), shopDay(1), shopDay(2)];

  const [rows, counts] = await Promise.all([
    query(
      `SELECT id, name, phone, preferred_date, preferred_time, test_type, status
         FROM appointments
        WHERE preferred_date = ? AND status <> 'cancelled'
        ORDER BY STR_TO_DATE(preferred_time, '%h:%i %p') IS NULL, STR_TO_DATE(preferred_time, '%h:%i %p'), id`,
      [day],
    ),
    query(
      `SELECT preferred_date AS day, COUNT(*) AS count FROM appointments
        WHERE preferred_date IN (?, ?, ?) AND status <> 'cancelled'
        GROUP BY preferred_date`,
      days,
    ),
  ]);

  const countFor = (d: string) =>
    Number((counts as any[]).find((c) => String(c.day instanceof Date ? shopDate(c.day) : c.day).slice(0, 10) === d)?.count ?? 0);

  return NextResponse.json({
    day,
    days: days.map((d) => ({ day: d, count: countFor(d) })),
    bookings: (rows as any[]).map((r) => ({
      id: Number(r.id),
      name: r.name,
      phone: r.phone,
      time: r.preferred_time,
      type: r.test_type,
      status: r.status,
    })),
  });
}

const createSchema = z.object({
  name: z.string().trim().min(2, 'name is required').max(255),
  phone: z.string().trim().regex(/^\+?[\d\s-]{10,16}$/, 'phone must be a valid number'),
  day: z.string().regex(DATE, 'day must be YYYY-MM-DD'),
  time: z.string().trim().regex(/^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/, 'time must look like 04:30 PM'),
  type: z.string().trim().max(100).optional(),
});

// POST /api/admin/simple/bookings — "+ Add booking" at the counter or by phone.
export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const parsed = validate(createSchema, await request.json().catch(() => null));
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  if (b.day < shopDate()) return NextResponse.json({ error: 'Pick today or a later day.' }, { status: 400 });

  const time = b.time.padStart(8, '0');
  const id = await withTransaction(async (tx) => {
    const result = (await tx.query(
      `INSERT INTO appointments (name, phone, preferred_date, preferred_time, test_type, wears_glasses, status)
       VALUES (?, ?, ?, ?, ?, 'No', 'pending')`,
      [b.name, b.phone, b.day, time, b.type || 'Eye Testing'],
    )) as any;
    const newId = Number(result?.insertId ?? 0);
    await tx.query(
      'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
      [randomUUID(), 'CREATE', 'appointment', String(newId), `Added booking for ${b.name} on ${b.day} at ${time}`, session.name, session.role],
    );
    return newId;
  });
  return NextResponse.json({ booking: { id, name: b.name, phone: b.phone, time, type: b.type || 'Eye Testing', status: 'pending' } }, { status: 201 });
}
