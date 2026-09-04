'use client';

import { useEffect, useState } from 'react';
import { getStore } from '@/app/lib/admin/store';
import type { Supplier } from '@/app/lib/admin/types';
import { Search, Phone, Mail } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { setSuppliers(getStore().suppliers); }, []);

  const filtered = suppliers.filter((s) => {
    const q = query.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });

  const totalOwed = suppliers.reduce((s, sup) => s + sup.balance, 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Suppliers</div>
          <div className="adm-page-sub">{suppliers.length} suppliers · Total owed: {fmt(totalOwed)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="adm-search-wrap" style={{ maxWidth: 300 }}>
          <Search />
          <input className="adm-input" placeholder="Search suppliers…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map((sup) => (
          <div key={sup.id} className="adm-card">
            <div className="adm-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{sup.name}</div>
                  {sup.contactPerson && <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>{sup.contactPerson}</div>}
                </div>
                <span className={`adm-badge ${sup.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>{sup.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone width={13} height={13} style={{ color: '#94a3b8' }} /> {sup.phone}</div>
                {sup.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail width={13} height={13} style={{ color: '#94a3b8' }} /> {sup.email}</div>}
                {sup.gst && <div style={{ fontSize: 12, color: '#94a3b8' }}>GST: {sup.gst}</div>}
              </div>
              {sup.balance > 0 && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: '#fff8e6', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Outstanding</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>{fmt(sup.balance)}</span>
                </div>
              )}
              {sup.balance === 0 && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
                  ✓ All Cleared
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
