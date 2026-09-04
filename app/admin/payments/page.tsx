'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Invoice, PaymentMethod } from '@/app/lib/admin/types';
import { CheckCircle, X } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export default function PaymentsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [saving, setSaving] = useState(false);

  const load = () => { setInvoices(getStore().invoices.filter((i) => i.balance > 0 && i.status !== 'cancelled').slice().reverse()); };
  useEffect(load, []);

  const total = invoices.reduce((s, i) => s + i.balance, 0);

  const handlePayment = async () => {
    if (!selected) return;
    const amount = parseFloat(payAmt);
    if (!amount || amount <= 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const store = getStore();
    const idx = store.invoices.findIndex((i) => i.id === selected.id);
    if (idx !== -1) {
      const inv = store.invoices[idx];
      inv.payments.push({ id: generateId('pay'), amount, method: payMethod, date: new Date().toISOString(), receivedBy: user?.name ?? '' });
      inv.paid += amount;
      inv.balance = Math.max(0, inv.balance - amount);
      inv.status = inv.balance <= 0 ? 'paid' : 'partially_paid';
      saveStore(store);
    }
    setSaving(false);
    setSelected(null);
    setPayAmt('');
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Pending Payments</div>
          <div className="adm-page-sub">{invoices.length} customers with outstanding balances</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="adm-card">
          <div className="adm-card-body adm-empty">
            <div className="adm-empty-icon">✅</div>
            <div>All payments are cleared!</div>
          </div>
        </div>
      ) : (
        <>
          <div className="adm-stat" style={{ marginBottom: 16, display: 'inline-flex', flexDirection: 'column', gap: 4, padding: '16px 24px' }}>
            <div className="adm-stat-label">Total Outstanding</div>
            <div className="adm-stat-value" style={{ color: '#d97706' }}>{fmt(total)}</div>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Customer</th><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance Due</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{inv.customerPhone}</div>
                    </td>
                    <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 600, textDecoration: 'none' }}>{inv.invoiceNumber}</Link></td>
                    <td style={{ fontWeight: 600 }}>{fmt(inv.total)}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                    <td style={{ color: '#d97706', fontWeight: 700, fontSize: 15 }}>{fmt(inv.balance)}</td>
                    <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <button onClick={() => { setSelected(inv); setPayAmt(String(inv.balance)); }} className="adm-btn adm-btn-primary adm-btn-sm">
                        <CheckCircle width={12} height={12} /> Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Collect Payment — {selected.customerName}</span>
              <button onClick={() => setSelected(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#fff8e6', borderRadius: 10, fontSize: 14, color: '#92400e' }}>
                Invoice: <strong>{selected.invoiceNumber}</strong> · Balance: <strong>{fmt(selected.balance)}</strong>
              </div>
              <div className="adm-field">
                <label className="adm-label">Amount (₹)</label>
                <input className="adm-input" type="number" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} autoFocus />
              </div>
              <div className="adm-field">
                <label className="adm-label">Method</label>
                <select className="adm-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setSelected(null)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={handlePayment} disabled={saving} className="adm-btn adm-btn-primary">
                {saving ? 'Saving…' : <><CheckCircle width={13} height={13} /> Record Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
