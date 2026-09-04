'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore } from '@/app/lib/admin/store';
import type { Purchase } from '@/app/lib/admin/types';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => { setPurchases(getStore().purchases.slice().reverse()); }, []);

  const total = purchases.reduce((s, p) => s + p.total, 0);
  const paid = purchases.reduce((s, p) => s + p.paid, 0);
  const balance = purchases.reduce((s, p) => s + p.balance, 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Purchases</div>
          <div className="adm-page-sub">{purchases.length} purchase orders</div>
        </div>
      </div>

      <div className="adm-grid-3" style={{ marginBottom: 20 }}>
        <div className="adm-stat"><div className="adm-stat-label">Total Purchases</div><div className="adm-stat-value" style={{ fontSize: 20 }}>{fmt(total)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Paid to Suppliers</div><div className="adm-stat-value" style={{ fontSize: 20, color: '#16a34a' }}>{fmt(paid)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Supplier Balance</div><div className="adm-stat-value" style={{ fontSize: 20, color: balance > 0 ? '#d97706' : '#94a3b8' }}>{fmt(balance)}</div></div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Bill #</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700, color: '#fc5a06' }}>{p.purchaseNumber}</td>
                <td style={{ fontWeight: 600 }}>{p.supplierName}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{p.supplierBillNumber}</td>
                <td style={{ color: '#64748b', fontSize: 12.5 }}>{p.items.length} item{p.items.length !== 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 700 }}>{fmt(p.total)}</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(p.paid)}</td>
                <td style={{ color: p.balance > 0 ? '#d97706' : '#94a3b8', fontWeight: p.balance > 0 ? 700 : 400 }}>{p.balance > 0 ? fmt(p.balance) : '—'}</td>
                <td><span className={`adm-badge ${p.status === 'paid' ? 'adm-badge-success' : p.status === 'partially_paid' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>{p.status === 'paid' ? 'Paid' : p.status === 'partially_paid' ? 'Part Paid' : 'Pending'}</span></td>
                <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
