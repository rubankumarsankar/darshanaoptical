import { NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/admin/session';
import { sendTestNotification } from '@/app/lib/mailer';

export async function POST() {
  const { error } = await requireRole('admin');
  if (error) return error;

  try {
    const result = await sendTestNotification();
    return NextResponse.json({
      message: 'Test email sent successfully.',
      recipients: { to: result.to, cc: result.cc ?? null, bcc: result.bcc ?? null },
    });
  } catch (error) {
    console.error('[admin/settings/test-email] Failed:', error);
    const smtpCode = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    const message = smtpCode === 'EAUTH'
      ? 'Gmail rejected the SMTP credentials. Update SMTP_PASS with a current Google app password and restart the server.'
      : 'The mail provider could not deliver the test email. Check the server log for details.';
    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }
}
