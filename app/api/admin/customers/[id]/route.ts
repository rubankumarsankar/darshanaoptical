import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { validate, customerPathRefSchema, customerUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

function parseCustomerRef(value: string) {
  const parsed = customerPathRefSchema.safeParse(value);
  return parsed.success
    ? { ref: parsed.data, error: null }
    : { ref: null, error: NextResponse.json({ error: 'Invalid customer reference.' }, { status: 400 }) };
}

async function findCustomer(ref: string) {
  const [customer] = await query(
    'SELECT * FROM customers WHERE id = ? OR customer_id = ? LIMIT 1',
    [ref, ref],
  ) as any[];
  return customer;
}

// GET /api/admin/customers/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;

  const { id: value } = await params;
  const { ref, error: refError } = parseCustomerRef(value);
  if (refError) return refError;
  const customer = await findCustomer(ref!);
  if (!customer) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const internalId = customer.id;

  // Also fetch eye tests and invoices for customer profile
  const eyeTests = await query(
    'SELECT * FROM eye_tests WHERE customer_id = ? ORDER BY test_date DESC', [internalId]
  );
  const invoices = await query(
    'SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC', [internalId]
  );

  return NextResponse.json({ customer, eyeTests, invoices });
}

// PUT /api/admin/customers/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: value } = await params;
  const { ref, error: refError } = parseCustomerRef(value);
  if (refError) return refError;
  const existing = await findCustomer(ref!);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const internalId = existing.id;

  const parsed = validate(customerUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const name = body.name ?? existing.name;
  const phone = body.phone ?? existing.phone;
  const email = body.email !== undefined ? body.email : existing.email;
  const gender = body.gender !== undefined ? body.gender : existing.gender;
  const dob = body.dob !== undefined ? body.dob : existing.dob;
  const address = body.address !== undefined ? body.address : existing.address;
  const notes = body.notes !== undefined ? body.notes : existing.notes;
  const status = body.status !== undefined ? body.status : existing.status;

  await query(
    `UPDATE customers SET name=?, phone=?, email=?, gender=?, dob=?, address=?, notes=?, status=?, updated_at=NOW()
     WHERE id=?`,
    [name, phone, email || null, gender || null, dob || null, address || null, notes || null, status, internalId]
  );

  await query(
    `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
     VALUES (?, 'UPDATE', 'customer', ?, ?, ?, ?)`,
    [randomUUID(), internalId, `Updated customer: ${name}`, session.name, session.role]
  );

  const [updated] = await query('SELECT * FROM customers WHERE id = ?', [internalId]) as any[];
  return NextResponse.json({ customer: updated });
}

// DELETE /api/admin/customers/[id]
//
// Soft delete. A hard DELETE cascaded to eye_tests, destroying the customer's
// prescription history, and left their invoices orphaned (invoices have no
// foreign key back to customers). Marking the row inactive hides the customer
// from the active list while keeping the billing and prescription record intact.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole('admin');
  if (error) return error;

  const { id: value } = await params;
  const { ref, error: refError } = parseCustomerRef(value);
  if (refError) return refError;
  const c = await findCustomer(ref!);
  if (!c) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const internalId = c.id;

  await query("UPDATE customers SET status='inactive', updated_at=NOW() WHERE id = ?", [internalId]);
  await query(
    `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
     VALUES (?, 'DELETE', 'customer', ?, ?, ?, ?)`,
    [randomUUID(), internalId, `Deactivated customer: ${c.name}`, session.name, session.role]
  );
  return NextResponse.json({ success: true });
}
