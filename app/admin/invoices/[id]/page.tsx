'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import AdminLoader from '../../components/AdminLoader';
import TablePagination from '../../components/TablePagination';
import { ArrowLeft, Printer, Plus, CheckCircle, X, FileText, ClipboardList, Mail } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

const STATUS_COLORS: Record<string, string> = {
  paid: 'adm-badge-success', partially_paid: 'adm-badge-warning', pending: 'adm-badge-danger', cancelled: 'adm-badge-gray',
  new: 'adm-badge-info', lens_ordered: 'adm-badge-orange', in_process: 'adm-badge-warning', ready: 'adm-badge-success', delivered: 'adm-badge-gray',
};
const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid', partially_paid: 'Partially Paid', pending: 'Pending', cancelled: 'Cancelled',
  new: 'New', lens_ordered: 'Lens Ordered', in_process: 'In Process', ready: 'Ready', delivered: 'Delivered',
};

type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank';

function PrescriptionTable({ test, compact = false }: { test: any; compact?: boolean }) {
  const fields = ['SPH', 'CYL', 'AXIS', 'ADD', 'PD'];
  const rows = [
    ['Right (OD)', test.re_sph, test.re_cyl, test.re_axis, test.re_add, test.re_pd],
    ['Left (OS)', test.le_sph, test.le_cyl, test.le_axis, test.le_add, test.le_pd],
  ];
  return (
    <div className={compact ? 'adm-prescription-table is-compact' : 'adm-prescription-table'}>
      <table>
        <thead><tr><th>Eye</th>{fields.map((field) => <th key={field}>{field}</th>)}</tr></thead>
        <tbody>{rows.map(([eye, ...values]) => <tr key={eye}><td>{eye}</td>{values.map((value, index) => <td key={index}>{value || '—'}</td>)}</tr>)}</tbody>
      </table>
      <div className="adm-prescription-meta">
        <span>VA Right: <strong>{test.visual_acuity_right || '—'}</strong></span>
        <span>VA Left: <strong>{test.visual_acuity_left || '—'}</strong></span>
        <span>Tested by: <strong>{test.tested_by || '—'}</strong></span>
      </div>
      {test.recommendation && <p><strong>Recommendation:</strong> {test.recommendation}</p>}
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error, refetch } = useAdminFetch<{ invoice: any; items: any[]; payments: any[]; settings: any; eyeTest: any | null; customerEmail: string | null }>(`/api/admin/invoices/${id}`);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailResult, setEmailResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [printMode, setPrintMode] = useState<'invoice' | 'prescription' | 'jobcard' | null>(null);

  useEffect(() => {
    const invoiceNumber = data?.invoice?.invoice_number?.toLowerCase();
    if (invoiceNumber && id !== invoiceNumber) {
      router.replace(`/admin/invoices/${encodeURIComponent(invoiceNumber)}`);
    }
  }, [data?.invoice?.invoice_number, id, router]);

  if (error) {
    router.replace('/admin/invoices');
    return null;
  }
  if (loading || !data) return <AdminLoader label="Loading invoice" />;

  const { invoice, items, payments, settings, eyeTest, customerEmail } = data;

  const printDocument = (mode: 'invoice' | 'prescription' | 'jobcard') => {
    setPrintMode(mode);
    window.setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 80);
  };

  const handlePayment = async () => {
    const amount = parseFloat(payAmt);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await adminPut(`/api/admin/invoices/${encodeURIComponent(invoice.invoice_number.toLowerCase())}`, {
        add_payment: amount,
        payment_method: payMethod,
        payment_notes: payNotes || undefined,
      });
      await refetch();
      setShowPayModal(false);
      setPayAmt('');
      setPayNotes('');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailBill = async () => {
    setEmailing(true);
    setEmailResult(null);
    try {
      const result = await adminPost<{ message: string }>(
        `/api/admin/invoices/${encodeURIComponent(invoice.invoice_number.toLowerCase())}/email`, {}
      );
      setEmailResult({ type: 'success', message: result.message });
    } catch (emailError: any) {
      setEmailResult({ type: 'error', message: emailError.message ?? 'Failed to email bill.' });
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="adm-print-page" data-print-mode={printMode ?? undefined} style={{ maxWidth: 820 }}>
      <div className="adm-page-header adm-no-print">
        <Link href="/admin/invoices" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft width={14} height={14} /> Invoices</Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">{invoice.invoice_number}</div>
          <div className="adm-page-sub">{invoice.customer_name} · {fmtDate(invoice.created_at)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => printDocument('invoice')} className="adm-btn adm-btn-secondary adm-btn-sm"><Printer width={13} height={13} /> Print Bill</button>
          <a href={`/api/admin/invoices/${encodeURIComponent(invoice.invoice_number.toLowerCase())}/email`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm"><Mail width={13} height={13} /> Preview Email</a>
          <button onClick={handleEmailBill} disabled={emailing || !customerEmail} title={customerEmail ? `Send to ${customerEmail}` : 'Add an email to the customer profile first'} className="adm-btn adm-btn-secondary adm-btn-sm"><Mail width={13} height={13} /> {emailing ? 'Sending...' : customerEmail ? 'Email Bill' : 'No Customer Email'}</button>
          <button onClick={() => printDocument('jobcard')} className="adm-btn adm-btn-secondary adm-btn-sm"><ClipboardList width={13} height={13} /> Job Card</button>
          {eyeTest && <button onClick={() => printDocument('prescription')} className="adm-btn adm-btn-secondary adm-btn-sm"><FileText width={13} height={13} /> Prescription</button>}
          {Number(invoice.balance) > 0 && invoice.status !== 'cancelled' && (
            <button onClick={() => setShowPayModal(true)} className="adm-btn adm-btn-primary adm-btn-sm"><Plus width={13} height={13} /> Receive Payment</button>
          )}
        </div>
      </div>

      {emailResult && <div className="adm-no-print" style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: emailResult.type === 'success' ? '#f0fdf4' : '#fef2f2', color: emailResult.type === 'success' ? '#15803d' : '#dc2626', fontSize: 13 }}>{emailResult.message}</div>}

      {/* Status Row */}
      <div className="adm-no-print" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className={`adm-badge ${STATUS_COLORS[invoice.status]}`}>{STATUS_LABELS[invoice.status]}</span>
        {invoice.order_status && <span className={`adm-badge ${STATUS_COLORS[invoice.order_status]}`}>Order: {STATUS_LABELS[invoice.order_status]}</span>}
        {invoice.delivered_at && <span style={{ fontSize: 12, color: '#64748b' }}>Delivered: {new Date(invoice.delivered_at).toLocaleDateString('en-IN')}</span>}
      </div>

      <article className="adm-card adm-print-sheet print-section print-invoice adm-bill-sheet">
        <header className="adm-bill-letterhead">
          <div className="adm-bill-brand">
            <div className="adm-bill-logo"><Image src="/logo.png" alt="Darshana Optical logo" width={64} height={64} priority /></div>
            <div><h1>{settings?.shop_name || 'Darshana Optical'}</h1><p>{settings?.tagline || 'Quality eye care for a better life'}</p></div>
          </div>
          <div className="adm-bill-shop">
            <strong>{settings?.address || 'TVK Nagar, Salem Bypass Road'}</strong>
            <span>{[settings?.city || 'Harur', settings?.state || 'Tamil Nadu', settings?.pincode || '636903'].filter(Boolean).join(', ')}</span>
            <span>{settings?.phone || '88705 71536'} | {settings?.email || 'darshanaoptical31@gmail.com'}</span>
            {settings?.gst && <span>GSTIN: {settings.gst}</span>}
          </div>
        </header>

        <div className="adm-bill-title-row">
          <div><span className="adm-bill-kicker">Sales document</span><h2>Tax Invoice</h2></div>
          <div className="adm-bill-reference"><span>Invoice number</span><strong>{invoice.invoice_number}</strong><small>{fmtDate(invoice.created_at)}</small></div>
        </div>

        <section className="adm-bill-customer">
          <div><span>Bill to</span><strong>{invoice.customer_name}</strong><small>{invoice.customer_phone}</small></div>
          <div><span>Payment status</span><strong>{STATUS_LABELS[invoice.status] || invoice.status}</strong><small>{invoice.order_status ? `Order: ${STATUS_LABELS[invoice.order_status] || invoice.order_status}` : 'Retail sale'}</small></div>
          <div><span>Created by</span><strong>{invoice.created_by || 'Darshana Optical'}</strong><small>{invoice.delivered_at ? `Delivered ${new Date(invoice.delivered_at).toLocaleDateString('en-IN')}` : 'Store billing desk'}</small></div>
        </section>

        <div className="adm-bill-items">
          <table>
            <thead><tr><th>#</th><th>Description</th><th>Code</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>{items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td><strong>{item.product_name}</strong><span>{item.category || 'Optical product'}</span></td>
                <td>{item.product_code || 'Not listed'}</td>
                <td>{item.quantity}</td>
                <td>{fmt(item.unit_price)}</td>
                <td>{fmt(item.total)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <section className="adm-bill-settlement">
          <div className="adm-bill-payment-note">
            <span>Payment summary</span>
            <p>{Number(invoice.balance) > 0 ? `An outstanding balance of ${fmt(invoice.balance)} remains on this invoice.` : 'Payment received in full. Thank you for your purchase.'}</p>
          </div>
          <div className="adm-bill-totals">
            <div><span>Subtotal</span><strong>{fmt(invoice.subtotal)}</strong></div>
            {Number(invoice.discount_amount) > 0 && <div className="is-discount"><span>Discount ({Number(invoice.discount_percent).toFixed(1)}%)</span><strong>-{fmt(invoice.discount_amount)}</strong></div>}
            <div className="is-total"><span>Total</span><strong>{fmt(invoice.total)}</strong></div>
            <div><span>Amount paid</span><strong>{fmt(invoice.paid)}</strong></div>
            <div className={Number(invoice.balance) > 0 ? 'is-balance' : ''}><span>Balance due</span><strong>{fmt(invoice.balance)}</strong></div>
          </div>
        </section>

        <footer className="adm-bill-footer">
          <div className="adm-bill-terms"><strong>Terms and notes</strong><p>{settings?.invoice_terms || 'Goods once sold will not be taken back.'}</p><p>{invoice.notes || 'Please retain this invoice for service and warranty reference.'}</p></div>
          <div className="adm-bill-signature"><span>Authorised signature</span></div>
        </footer>
        <div className="adm-bill-thanks">{settings?.invoice_footer || 'Thank you for choosing Darshana Optical.'}</div>
      </article>

      {eyeTest && (
        <section className="adm-card adm-print-sheet print-section print-only print-prescription">
          <div className="adm-document-header">
            <div><span className="adm-document-kicker">Prescription</span><h1>{eyeTest.customer_name}</h1><p>{eyeTest.customer_phone}</p></div>
            <div className="adm-document-shop"><strong>{settings?.shop_name || 'Darshana Optical'}</strong><span>{settings?.address || 'Harur, Tamil Nadu'}</span><span>{settings?.phone || '88705 71536'}</span></div>
          </div>
          <PrescriptionTable test={eyeTest} />
        </section>
      )}

      <section className="adm-card adm-print-sheet print-section print-only print-jobcard">
        <div className="adm-document-header">
          <div><span className="adm-document-kicker">Job card</span><h1>{invoice.customer_name}</h1><p>{invoice.customer_phone}</p></div>
          <div className="adm-document-shop"><strong>{invoice.invoice_number}</strong><span>{fmtDate(invoice.created_at)}</span><span>Expected: {invoice.expected_date ? new Date(invoice.expected_date).toLocaleDateString('en-IN') : 'Not set'}</span></div>
        </div>
        <div className="adm-job-grid">
          <div><span>Frame</span><strong>{invoice.frame_product || '—'}</strong></div>
          <div><span>Lens</span><strong>{invoice.lens_product || '—'}</strong></div>
          <div><span>Order status</span><strong>{STATUS_LABELS[invoice.order_status] || invoice.order_status || 'New'}</strong></div>
          <div><span>Balance due</span><strong>{fmt(invoice.balance)}</strong></div>
        </div>
        {eyeTest && <PrescriptionTable test={eyeTest} compact />}
        <div className="adm-job-notes"><strong>Work notes</strong><p>{invoice.notes || '________________________________________________________________'}</p></div>
      </section>

      {/* Payments */}
      {payments.length > 0 && (
        <div className="adm-card adm-no-print">
          <div className="adm-card-header"><span className="adm-card-title">Payment History</span></div>
          <div className="adm-table-wrap" style={{ border: 0, borderRadius: 0, boxShadow: 'none' }}>
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Received By</th><th>Notes</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12.5 }}>{fmtDate(p.payment_date)}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(p.amount)}</td>
                  <td style={{ textTransform: 'capitalize', color: '#64748b' }}>{p.method}</td>
                  <td style={{ color: '#64748b' }}>{p.received_by}</td>
                  <td style={{ color: '#94a3b8', fontSize: 12.5 }}>{p.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <TablePagination />
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="adm-overlay" onClick={() => setShowPayModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Receive Payment</span>
              <button onClick={() => setShowPayModal(false)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#faf8f5', borderRadius: 10, fontSize: 14 }}>
                Outstanding Balance: <strong style={{ color: '#d97706' }}>{fmt(invoice.balance)}</strong>
              </div>
              <div className="adm-field">
                <label className="adm-label">Amount (₹)</label>
                <input className="adm-input" type="number" placeholder={String(invoice.balance)} value={payAmt} onChange={(e) => setPayAmt(e.target.value)} autoFocus />
              </div>
              <div className="adm-field">
                <label className="adm-label">Payment Method</label>
                <select className="adm-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Google Pay</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div className="adm-field">
                <label className="adm-label">Notes</label>
                <input className="adm-input" placeholder="Optional" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setShowPayModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={handlePayment} disabled={saving || !payAmt} className="adm-btn adm-btn-primary">
                {saving ? 'Saving…' : <><CheckCircle width={13} height={13} /> Record Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
