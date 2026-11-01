import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  mails: [] as any[],
  settings: {} as Record<string, string | null>,
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async () => [state.settings]),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn(async (mail: any) => { state.mails.push(mail); }),
    }),
  },
}));

const { sendAppointmentConfirmation, sendInquiryNotification, sendTestNotification } = await import('@/app/lib/mailer');
const { sendInvoiceEmail } = await import('@/app/lib/invoice-mailer');

beforeEach(() => {
  state.mails = [];
  state.settings = {};
  process.env.SMTP_FROM = 'owner@example.com';
  process.env.SMTP_PASS = 'test-password';
});

describe('mailer HTML escaping', () => {
  it('sends a branded invoice only to the customer and escapes bill content', async () => {
    await sendInvoiceEmail({
      customerEmail: 'customer@example.com',
      invoice: {
        invoice_number: 'DO-2026-00100', customer_name: '<script>Ravi</script>', status: 'partially_paid',
        created_at: '2026-11-02T10:00:00Z', subtotal: 1000, discount_amount: 50, total: 950, paid: 500, balance: 450,
      },
      items: [{ product_name: '<img src=x>', product_code: 'FR-1', quantity: 1, unit_price: 1000, total: 1000 }],
      settings: { shop_name: 'Darshana Optical', phone: '8870571536', email: 'shop@example.com' },
    });
    expect(state.mails).toHaveLength(1);
    expect(state.mails[0].to).toBe('customer@example.com');
    expect(state.mails[0].cc).toBeUndefined();
    expect(state.mails[0].bcc).toBeUndefined();
    expect(state.mails[0].html).toContain('DO-2026-00100');
    expect(state.mails[0].html).not.toContain('<script>Ravi</script>');
    expect(state.mails[0].html).not.toContain('<img src=x>');
  });

  it('sends a test message to the configured internal recipients', async () => {
    state.settings = {
      notification_to: 'owner@example.com',
      notification_cc: 'staff@example.com',
      notification_bcc: 'archive@example.com',
    };
    const result = await sendTestNotification();
    expect(result).toMatchObject({ to: 'owner@example.com', cc: 'staff@example.com', bcc: 'archive@example.com' });
    expect(state.mails).toHaveLength(1);
    expect(state.mails[0]).toMatchObject({
      to: 'owner@example.com', cc: 'staff@example.com', bcc: 'archive@example.com',
    });
    expect(state.mails[0].subject).toMatch(/email settings test/i);
  });

  it('escapes public appointment fields in owner and customer HTML', async () => {
    await sendAppointmentConfirmation({
      name: '<img src=x onerror=alert(1)>', phone: '9000000000', email: 'customer@example.com',
      testType: '<b>Injected</b>', notes: '<a href="https://evil.example">click</a>',
    });
    expect(state.mails).toHaveLength(2);
    for (const mail of state.mails) {
      expect(mail.html).not.toContain('<img src=x');
      expect(mail.html).not.toContain('<b>Injected</b>');
      expect(mail.html).toContain('&lt;img');
    }
  });

  it('uses configured To, CC and BCC only for the internal notification', async () => {
    state.settings = {
      notification_to: 'owner@example.com, manager@example.com',
      notification_cc: 'staff@example.com',
      notification_bcc: 'archive@example.com',
    };
    await sendAppointmentConfirmation({
      name: 'Ravi', phone: '9000000000', email: 'customer@example.com', testType: 'Eye Test',
    });
    expect(state.mails[0]).toMatchObject({
      to: 'owner@example.com, manager@example.com',
      cc: 'staff@example.com',
      bcc: 'archive@example.com',
    });
    expect(state.mails[1]).toMatchObject({ to: 'customer@example.com' });
    expect(state.mails[1].cc).toBeUndefined();
    expect(state.mails[1].bcc).toBeUndefined();
  });

  it('escapes inquiry fields and strips newlines from the subject', async () => {
    await sendInquiryNotification({
      name: 'Attacker\r\nBcc: victim@example.com', phone: '9000000000',
      interest: '<strong>Frames</strong>', message: '<script>alert(1)</script>',
    });
    expect(state.mails).toHaveLength(1);
    expect(state.mails[0].html).not.toContain('<script>');
    expect(state.mails[0].html).toContain('&lt;script&gt;');
    expect(state.mails[0].subject).not.toMatch(/[\r\n]/);
  });
});
