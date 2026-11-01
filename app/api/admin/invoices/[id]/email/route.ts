import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { invoicePathRefSchema } from '@/app/lib/admin/validation';
import { renderInvoiceEmail, sendInvoiceEmail } from '@/app/lib/invoice-mailer';

async function loadInvoiceEmailData(value: string) {
  const parsed = invoicePathRefSchema.safeParse(value);
  if (!parsed.success) return { status: 400, error: 'Invalid invoice reference.' } as const;
  const [invoice] = await query(
    `SELECT i.*, c.email AS customer_email FROM invoices i JOIN customers c ON c.id = i.customer_id
     WHERE i.id = ? OR i.invoice_number = ? LIMIT 1`,
    [parsed.data, parsed.data],
  ) as any[];
  if (!invoice) return { status: 404, error: 'Invoice not found.' } as const;
  const items = await query('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id', [invoice.id]) as any[];
  const [settings] = await query('SELECT * FROM shop_settings WHERE id=1') as any[];
  return { invoice, items, settings: settings ?? {} };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const data = await loadInvoiceEmailData(id);
  if ('error' in data) return NextResponse.json({ error: data.error }, { status: data.status });
  const { html } = renderInvoiceEmail(data);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: value } = await params;
  const data = await loadInvoiceEmailData(value);
  if ('error' in data) return NextResponse.json({ error: data.error }, { status: data.status });
  const { invoice, items, settings } = data;
  if (!invoice.customer_email) {
    return NextResponse.json({ error: 'This customer has no email address. Add one to the customer profile first.' }, { status: 400 });
  }

  try {
    await sendInvoiceEmail({ customerEmail: invoice.customer_email, invoice, items, settings });
    await query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'EMAIL', 'invoice', invoice.id, `Emailed invoice ${invoice.invoice_number} to ${invoice.customer_email}`, session.name, session.role],
    );
    return NextResponse.json({ message: `Bill emailed to ${invoice.customer_email}.`, email: invoice.customer_email });
  } catch (mailError) {
    console.error('[admin/invoices/email] Failed:', mailError);
    const code = typeof mailError === 'object' && mailError !== null && 'code' in mailError ? String(mailError.code) : '';
    const message = code === 'EAUTH'
      ? 'Gmail rejected the SMTP credentials. Update SMTP_PASS and restart the server.'
      : 'The email provider could not deliver this bill. Please try again.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
