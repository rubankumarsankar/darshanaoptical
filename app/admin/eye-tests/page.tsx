'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore } from '@/app/lib/admin/store';
import type { EyeTest } from '@/app/lib/admin/types';
import { Search, Plus, Eye } from 'lucide-react';

export default function EyeTestsPage() {
  const [tests, setTests] = useState<EyeTest[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { setTests(getStore().eyeTests.slice().reverse()); }, []);

  const filtered = tests.filter((t) => {
    const q = query.toLowerCase();
    return !q || t.customerName.toLowerCase().includes(q) || t.customerPhone.includes(q) || t.date.includes(q);
  });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Eye Tests</div>
          <div className="adm-page-sub">{tests.length} records total</div>
        </div>
        <Link href="/admin/eye-tests/new" className="adm-btn adm-btn-primary">
          <Plus width={14} height={14} /> New Eye Test
        </Link>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <Search />
          <input className="adm-input" placeholder="Search by customer name or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Right Eye (OD)</th>
              <th>Left Eye (OS)</th>
              <th>Tested By</th>
              <th>Recommendation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No eye tests found.</td></tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.customerName}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{t.customerPhone}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>
                    {t.rightEye.sph} / {t.rightEye.cyl} × {t.rightEye.axis}
                    {t.rightEye.add ? ` +${t.rightEye.add}` : ''}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>
                    {t.leftEye.sph} / {t.leftEye.cyl} × {t.leftEye.axis}
                    {t.leftEye.add ? ` +${t.leftEye.add}` : ''}
                  </td>
                  <td style={{ color: '#64748b' }}>{t.testedBy}</td>
                  <td style={{ fontSize: 12.5, color: '#475569', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.recommendation ?? '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/prescriptions/${t.id}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="View prescription">
                        <Eye width={13} height={13} />
                      </Link>
                      <Link href={`/admin/pos?eyeTestId=${t.id}&customerId=${t.customerId}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="Start sale from prescription">
                        🛒
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
