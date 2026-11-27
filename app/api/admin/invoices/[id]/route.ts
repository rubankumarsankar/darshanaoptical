import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate, invoicePathRefSchema, invoiceUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

function parseInvoiceRef(value: string) {
  const parsed = invoicePathRefSchema.safeParse(value);
  return parsed.success
    ? { ref: parsed.data, error: null }
    : { ref: null, error: NextResponse.json({ error: 'Invalid invoice reference.' }, { status: 400 }) };
}

/** Rounds to paise so floating-point drift (0.7 + 0.1 = 0.7999…) never decides an invoice's status. */
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

async function findInvoice(ref: string) {
  const [invoice] = await query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ? LIMIT 1', [ref, ref]) as any[];
  return invoice;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id: value } = await params;
  const { ref, error: refError } = parseInvoiceRef(value);
  if (refError) return refError;
  const invoice = await findInvoice(ref!);
  if (!invoice) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const internalId = invoice.id;
  // Independent reads run in parallel: each query() opens its own connection,
  // so running them one after another pays a TLS handshake per query.
  const [items, payments, [customer], [settings], [eyeTest]] = await Promise.all([
    query('SELECT * FROM invoice_items WHERE invoice_id = ?', [internalId]),
    query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at', [internalId]),
    query('SELECT email FROM customers WHERE id = ? LIMIT 1', [invoice.customer_id]) as Promise<any[]>,
    query('SELECT * FROM shop_settings WHERE id=1') as Promise<any[]>,
    invoice.eye_test_id
      ? query('SELECT * FROM eye_tests WHERE id = ? LIMIT 1', [invoice.eye_test_id]) as Promise<any[]>
      : Promise.resolve([] as any[]),
  ]);
  return NextResponse.json({ invoice, items, payments, settings: settings ?? {}, eyeTest: eyeTest ?? null, customerEmail: customer?.email ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id: value } = await params;
  const { ref, error: refError } = parseInvoiceRef(value);
  if (refError) return refError;
  const parsed = validate(invoiceUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  // Checked before anything is written: a request that combines a payment or
  // order update with a cancel must not half-apply and then be refused.
  if (b.cancel && session.role !== 'admin' && session.role !== 'manager') {
    return NextResponse.json({ error: 'Insufficient permission to cancel.' }, { status: 403 });
  }

  const current = await findInvoice(ref!);
  if (!current) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const internalId = current.id;

  // A cancelled invoice is closed: no further payments, no order progress.
  if (current.status === 'cancelled' && (b.add_payment || b.order_status !== undefined)) {
    return NextResponse.json({ error: 'This invoice is cancelled and can no longer be modified.' }, { status: 400 });
  }

  // Handle additional payment
  if (b.add_payment) {
    try {
      await withTransaction(async (tx) => {
        // Lock the invoice row so two concurrent payments can't both read the same
        // stale `paid`/`total` and overwrite each other's update (lost update).
        const [locked] = await tx.query('SELECT paid, total, status, invoice_number FROM invoices WHERE id = ? FOR UPDATE', [internalId]) as any[];
        if (!locked) throw new Error('Not found.');
        if (locked.status === 'cancelled') throw new Error('This invoice is cancelled and can no longer be modified.');

        // Reject overpayment rather than silently clamping the invoice while the
        // payments table still records the full amount — that inflated the
        // collected totals on the reports screen.
        const total = money(parseFloat(locked.total));
        const alreadyPaid = money(parseFloat(locked.paid));
        const payment = money(b.add_payment!);
        const outstanding = money(total - alreadyPaid);
        if (payment > outstanding) {
          throw new Error(`Payment of ₹${b.add_payment} exceeds the outstanding balance of ₹${outstanding}.`);
        }

        const newPaid = money(alreadyPaid + payment);
        const newBalance = Math.max(0, money(total - newPaid));
        const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

        await tx.query(
          'UPDATE invoices SET paid=?, balance=?, status=?, updated_at=NOW() WHERE id=?',
          [newPaid, newBalance, newStatus, internalId]
        );
        await tx.query(
          `INSERT INTO payments (id,invoice_id,amount,method,payment_date,notes,received_by) VALUES (?,?,?,?,NOW(),?,?)`,
          [randomUUID(), internalId, b.add_payment, b.payment_method??'cash', b.payment_notes||null, session.name]
        );
        await tx.query(
          `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
          [randomUUID(), 'PAYMENT', 'invoice', internalId,
           `Payment of ₹${b.add_payment} via ${b.payment_method??'cash'} on invoice ${locked.invoice_number}`,
           session.name, session.role]
        );
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Failed to record payment.' }, { status: 400 });
    }
  }

  // Handle order status update
  if (b.order_status !== undefined) {
    const deliveredAt = b.order_status === 'delivered' ? 'NOW()' : 'NULL';
    try {
      await withTransaction(async (tx) => {
        // Lock and re-check: a cancel committed after `current` was read must win.
        const [locked] = await tx.query('SELECT status, invoice_number FROM invoices WHERE id = ? FOR UPDATE', [internalId]) as any[];
        if (!locked) throw new Error('Not found.');
        if (locked.status === 'cancelled') throw new Error('This invoice is cancelled and can no longer be modified.');
        await tx.query(
          `UPDATE invoices SET order_status=?, delivered_at=${deliveredAt}, updated_at=NOW() WHERE id=?`,
          [b.order_status, internalId]
        );
        await tx.query(
          `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
          [randomUUID(), 'UPDATE', 'invoice', internalId,
           `Order status changed to '${b.order_status}' on invoice ${locked.invoice_number}`,
           session.name, session.role]
        );
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Failed to update order status.' }, { status: 400 });
    }
  }

  // Handle cancellation (permission already checked above)
  if (b.cancel) {
    try {
      await withTransaction(async (tx) => {
        // Lock + re-check status so two concurrent cancel requests can't both
        // pass and double-restore stock.
        const [locked] = await tx.query('SELECT status, paid, invoice_number FROM invoices WHERE id = ? FOR UPDATE', [internalId]) as any[];
        if (!locked) throw new Error('Not found.');
        if (locked.status === 'cancelled') return; // already cancelled — no-op

        // Reverse any money already taken by writing an offsetting refund row, so
        // SUM(payments.amount) for this invoice nets to zero and the payment
        // reports stop counting a cancelled sale as collected.
        const originalPayments = await tx.query(
          'SELECT amount, method FROM payments WHERE invoice_id = ? AND amount > 0', [internalId]
        ) as any[];
        for (const payment of originalPayments) {
          await tx.query(
            `INSERT INTO payments (id,invoice_id,amount,method,payment_date,notes,received_by) VALUES (?,?,?,?,NOW(),?,?)`,
            [randomUUID(), internalId, -parseFloat(payment.amount), payment.method, `Refund - invoice ${locked.invoice_number} cancelled`, session.name]
          );
        }

        await tx.query(
          "UPDATE invoices SET status='cancelled', order_status='cancelled', paid=0, balance=0, updated_at=NOW() WHERE id=?",
          [internalId]
        );
        // Restore stock
        const items = await tx.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [internalId]) as any[];
        for (const item of items) {
          if (item.category !== 'service') {
            await tx.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
            await tx.query(
              `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
               VALUES (?,?,?,?,'return',?,?,?,?)`,
              [randomUUID(), item.product_id, item.product_name, item.product_code,
               item.quantity, `Invoice ${locked.invoice_number} cancelled`, locked.invoice_number, session.name]
            );
          }
        }
        await tx.query(
          `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
          [randomUUID(), 'CANCEL', 'invoice', internalId, `Cancelled invoice ${locked.invoice_number}`, session.name, session.role]
        );
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Failed to cancel invoice.' }, { status: 400 });
    }
  }

  // Handle notes update
  if (b.notes !== undefined && !b.add_payment && !b.cancel && b.order_status === undefined) {
    await query('UPDATE invoices SET notes=?, updated_at=NOW() WHERE id=?', [b.notes, internalId]);
  }

  const [[updated], items, payments] = await Promise.all([
    query('SELECT * FROM invoices WHERE id = ?', [internalId]) as Promise<any[]>,
    query('SELECT * FROM invoice_items WHERE invoice_id = ?', [internalId]),
    query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at', [internalId]),
  ]);
  return NextResponse.json({ invoice: updated, items, payments });
}
