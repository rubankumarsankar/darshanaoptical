import nodemailer from 'nodemailer';
import { escapeHtml } from '@/app/lib/mailer';

export interface InvoiceEmailData {
  customerEmail: string;
  invoice: Record<string, any>;
  items: Record<string, any>[];
  settings: Record<string, any>;
}

const money = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const safeHeader = (value: unknown) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

export function renderInvoiceEmail({ invoice, items, settings }: Omit<InvoiceEmailData, 'customerEmail'>) {
  const shopName = settings.shop_name || 'Darshana Optical';
  const address = [settings.address, settings.city, settings.state, settings.pincode].filter(Boolean).join(', ');
  const status = String(invoice.status || 'pending').replaceAll('_', ' ');
  const invoiceDate = new Date(invoice.created_at).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric',
  });
  const itemRows = items.map((item) => `<tr>
    <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0"><strong>${escapeHtml(item.product_name)}</strong><br><span style="font-size:12px;color:#64748b">${escapeHtml(item.product_code || item.category || '')}</span></td>
    <td align="center" style="padding:12px 8px;border-bottom:1px solid #e2e8f0">${escapeHtml(item.quantity)}</td>
    <td align="right" style="padding:12px 8px;border-bottom:1px solid #e2e8f0">${money(item.unit_price)}</td>
    <td align="right" style="padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:700">${money(item.total)}</td>
  </tr>`).join('');

  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08)">
      <tr><td style="padding:28px 32px;background:#0f172a;border-bottom:5px solid #fc5a06"><h1 style="margin:0;color:#fff;font-size:25px">${escapeHtml(shopName)}</h1><p style="margin:6px 0 0;color:#cbd5e1;font-size:13px">${escapeHtml(address)}</p></td></tr>
      <tr><td style="padding:30px 32px">
        <table width="100%"><tr><td><span style="font-size:12px;color:#64748b;text-transform:uppercase">Invoice</span><h2 style="margin:4px 0;color:#fc5a06">${escapeHtml(invoice.invoice_number)}</h2><span style="font-size:13px;color:#64748b">${invoiceDate}</span></td><td align="right"><span style="display:inline-block;padding:7px 12px;border-radius:20px;background:#fff7ed;color:#c2410c;font-size:12px;font-weight:700;text-transform:capitalize">${escapeHtml(status)}</span></td></tr></table>
        <p style="margin:26px 0 6px">Dear <strong>${escapeHtml(invoice.customer_name)}</strong>,</p><p style="margin:0 0 24px;color:#475569;line-height:1.6">Thank you for choosing ${escapeHtml(shopName)}. Your bill details are below.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px"><thead><tr style="background:#f8fafc;color:#475569"><th align="left" style="padding:10px 8px">Item</th><th style="padding:10px 8px">Qty</th><th align="right" style="padding:10px 8px">Rate</th><th align="right" style="padding:10px 8px">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
        <table width="100%" style="margin-top:20px;font-size:13px"><tr><td></td><td width="230"><table width="100%"><tr><td style="padding:5px">Subtotal</td><td align="right">${money(invoice.subtotal)}</td></tr><tr><td style="padding:5px">Discount</td><td align="right">-${money(invoice.discount_amount)}</td></tr><tr><td style="padding:10px 5px;border-top:2px solid #0f172a;font-size:16px;font-weight:800">Total</td><td align="right" style="border-top:2px solid #0f172a;font-size:16px;font-weight:800">${money(invoice.total)}</td></tr><tr><td style="padding:5px;color:#16a34a">Paid</td><td align="right" style="color:#16a34a">${money(invoice.paid)}</td></tr><tr><td style="padding:5px;color:#dc2626;font-weight:700">Balance</td><td align="right" style="color:#dc2626;font-weight:700">${money(invoice.balance)}</td></tr></table></td></tr></table>
        ${settings.invoice_terms ? `<p style="margin:26px 0 0;padding:14px;background:#f8fafc;border-radius:10px;font-size:12px;color:#64748b"><strong>Terms:</strong> ${escapeHtml(settings.invoice_terms)}</p>` : ''}
        <p style="margin:24px 0 0;text-align:center;color:#64748b;font-size:12px">${escapeHtml(settings.invoice_footer || 'Thank you for choosing Darshana Optical!')}<br>${escapeHtml(settings.phone || '')} · ${escapeHtml(settings.email || '')}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  return {
    subject: `Invoice ${safeHeader(invoice.invoice_number)} from ${safeHeader(shopName)}`,
    html,
    text: `Invoice ${invoice.invoice_number}\nTotal: ${money(invoice.total)}\nPaid: ${money(invoice.paid)}\nBalance: ${money(invoice.balance)}\nThank you for choosing ${shopName}.`,
  };
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const sender = process.env.SMTP_FROM?.trim();
  const password = process.env.SMTP_PASS?.replace(/\s+/g, '');
  if (!sender || !password) throw new Error('SMTP_FROM and SMTP_PASS must be configured before sending invoices.');

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: sender, pass: password } });
  const content = renderInvoiceEmail(data);
  return transporter.sendMail({
    from: `"${safeHeader(data.settings.shop_name || 'Darshana Optical').replace(/"/g, '')}" <${sender}>`,
    to: data.customerEmail,
    ...content,
  });
}
