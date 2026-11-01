import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { sendAppointmentConfirmation, sendInquiryNotification } from '@/app/lib/mailer';
import { sendInvoiceEmail } from '@/app/lib/invoice-mailer';

function addresses(value: unknown): string[] {
  return String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

export async function POST() {
  const { error } = await requireRole('admin');
  if (error) return error;

  const [settings] = await query('SELECT * FROM shop_settings WHERE id=1') as any[];
  const recipients = [...new Set([
    ...addresses(settings?.notification_to),
    ...addresses(settings?.notification_cc),
  ])];
  if (!recipients.length) {
    return NextResponse.json({ error: 'Add at least one To or CC notification address first.' }, { status: 400 });
  }
  const reviewAddress = recipients.join(', ');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    await sendAppointmentConfirmation({
      name: 'Template Preview Customer', phone: '9000000000', email: reviewAddress,
      testType: 'Comprehensive Eye Examination', preferredDate: tomorrow,
      preferredTime: '10:30 AM - 11:00 AM', wearsGlasses: 'Yes',
      notes: 'This is a template preview. No appointment was created.',
    });
    await sendInquiryNotification({
      name: 'Template Preview Customer', phone: '9000000000', email: reviewAddress,
      interest: 'Premium Frames and Progressive Lenses',
      message: 'This is a template preview. No inquiry was created.',
    });
    await sendInvoiceEmail({
      customerEmail: reviewAddress,
      invoice: {
        invoice_number: 'DO-PREVIEW-001', customer_name: 'Template Preview Customer',
        status: 'partially_paid', created_at: new Date().toISOString(), subtotal: 6200,
        discount_amount: 200, total: 6000, paid: 2500, balance: 3500,
      },
      items: [
        { product_name: 'Premium Acetate Frame', product_code: 'FR-PREVIEW', category: 'frame', quantity: 1, unit_price: 3500, total: 3500 },
        { product_name: 'Progressive Anti-Glare Lenses', product_code: 'LN-PREVIEW', category: 'lens', quantity: 1, unit_price: 2700, total: 2700 },
      ],
      settings: settings ?? {},
    });
    return NextResponse.json({
      message: 'All email template samples were sent successfully.',
      recipients,
      templates: 5,
    });
  } catch (sendError) {
    console.error('[admin/settings/test-email/templates] Failed:', sendError);
    const code = typeof sendError === 'object' && sendError !== null && 'code' in sendError ? String(sendError.code) : '';
    return NextResponse.json({
      error: code === 'EAUTH'
        ? 'Gmail rejected the SMTP credentials. Update SMTP_PASS and restart the server.'
        : 'The mail provider could not send all template samples.',
    }, { status: 502 });
  }
}
