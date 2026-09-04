'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore } from '@/app/lib/admin/store';
import type { Invoice, InvoiceStatus } from '@/app/lib/admin/types';
import { Search } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

const STATUS_LABELS: Record<InvoiceStatus, string> = { paid: 'Paid', partially_paid: 'Part Paid', pending: 'Pending', cancelled: 'Cancelled' };
const STATUS_COLORS: Record<InvoiceStatus, string> = { paid: 'adm-badge-success', partially_paid: 'adm-badge-warning', pending: 'adm-badge-danger', cancelled: 'adm-badge-gray' };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  useEffect(() => { setInvoices(getStore().invoices.slice().reverse()); }, []);

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const q = query.toLowerCase();
    const matchQ = !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q) || inv.customerPhone.includes(q);
    return matchStatus && matchQ;
  });

  const totalSales = filtered.reduce((s, i) => s + i.total, 0);
  const totalReceived = filtered.reduce((s, i) => s + i.paid, 0);
  const totalPending = filtered.reduce((s, i) => s + i.balance, 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Invoices</div>
          <div className="adm-page-sub">{invoices.length} total invoices</div>
        </div>
        <Link href="/admin/pos" className="adm-btn adm-btn-primary">+ New Sale</Link>
      </div>

      {/* Summary */}
      <div className="adm-grid-3" style={{ marginBottom: 20 }}>
        <div className="adm-stat"><div className="adm-stat-label">Total Value</div><div className="adm-stat-value" style={{ fontSize: 20 }}>{fmt(totalSales)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Received</div><div className="adm-stat-value" style={{ fontSize: 20, color: '#16a34a' }}>{fmt(totalReceived)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Pending</div><div className="adm-stat-value" style={{ fontSize: 20, color: totalPending > 0 ? '#d97706' : '#94a3b8' }}>{fmt(totalPending)}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <Search />
          <input className="adm-input" placeholder="Search invoice #, customer…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {(['all', 'paid', 'partially_paid', 'pending', 'cancelled'] as const).map((s) => (
            <button key={s} className={`adm-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)} style={{ fontSize: 12 }}>
              {s === 'all' ? 'All' : STATUS_LABELS[s as InvoiceStatus]}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No invoices found.</td></tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id}>
                  <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 700, textDecoration: 'none' }}>{inv.invoiceNumber}</Link></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.customerPhone}</div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12.5 }}>{inv.items.map((i) => i.productName).join(', ')}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                  <td style={{ color: inv.balance > 0 ? '#d97706' : '#94a3b8', fontWeight: inv.balance > 0 ? 700 : 400 }}>{inv.balance > 0 ? fmt(inv.balance) : '—'}</td>
                  <td><span className={`adm-badge ${STATUS_COLORS[inv.status]}`}>{STATUS_LABELS[inv.status]}</span></td>
                  <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><Link href={`/admin/invoices/${inv.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">View</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
