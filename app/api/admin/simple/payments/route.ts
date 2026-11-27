import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate } from '@/app/lib/admin/validation';
import { allocatePayment, inr, money } from '@/app/lib/admin/simple';

const schema = z.object({
  customer_id: z.string().trim().min(1).max(36),
  amount: z.coerce.number().positive('amount must be more than zero').max(99_999_999.99),
  method: z.enum(['cash', 'upi', 'card', 'bank']),
});

// POST /api/admin/simple/payments — "Take payment" against everything a
// customer owes.
//
// The money is placed on their open bills oldest first. Every bill is locked
// (FOR UPDATE) and re-read inside one transaction, the total owed is worked out
// from those locked rows, and anything above it is refused — the same rules as
// PUT /api/admin/invoices/[id] add_payment, applied across several bills at once.
export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const parsed = validate(schema, await request.json().catch(() => null));
  if (parsed.error) return parsed.error;
  const { customer_id, method } = parsed.data;
  const amount = money(parsed.data.amount);

  try {
    const result = await withTransaction(async (tx) => {
      const bills = (await tx.query(
        `SELECT id, invoice_number, customer_name, total, paid, balance FROM invoices
          WHERE customer_id = ? AND balance > 0 AND status <> 'cancelled'
          ORDER BY created_at ASC, id ASC FOR UPDATE`,
        [customer_id],
      )) as any[];
      if (bills.length === 0) throw Object.assign(new Error('This customer has nothing left to pay.'), { status: 400 });

      const owed = money(bills.reduce((sum, b) => sum + Number(b.balance), 0));
      if (amount > owed) {
        throw Object.assign(new Error(`That is more than they owe. The most you can take is ${inr(owed)}.`), { status: 400 });
      }

      const parts = allocatePayment(amount, bills.map((b) => ({ id: b.id, balance: Number(b.balance) })));
      const touched: string[] = [];
      for (const part of parts) {
        const bill = bills.find((b) => b.id === part.id)!;
        const total = money(Number(bill.total));
        const paid = money(Number(bill.paid) + part.amount);
        const balance = Math.max(0, money(total - paid));
        const status = balance <= 0 ? 'paid' : 'partially_paid';
        await tx.query('UPDATE invoices SET paid=?, balance=?, status=?, updated_at=NOW() WHERE id=?', [paid, balance, status, bill.id]);
        await tx.query(
          'INSERT INTO payments (id,invoice_id,amount,method,payment_date,notes,received_by) VALUES (?,?,?,?,NOW(),?,?)',
          [randomUUID(), bill.id, part.amount, method, null, session.name],
        );
        await tx.query(
          'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
          [randomUUID(), 'PAYMENT', 'invoice', bill.id, `Payment of ₹${part.amount} via ${method} on invoice ${bill.invoice_number}`, session.name, session.role],
        );
        touched.push(bill.invoice_number);
      }
      return { received: amount, still_owed: money(owed - amount), invoices: touched, customer_name: bills[0].customer_name };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'The payment could not be saved.' }, { status: err.status ?? 400 });
  }
}
