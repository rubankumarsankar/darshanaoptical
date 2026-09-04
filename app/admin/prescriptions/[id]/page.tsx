'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStore } from '@/app/lib/admin/store';
import type { EyeTest } from '@/app/lib/admin/types';
import { ArrowLeft, Printer, ShoppingCart } from 'lucide-react';

export default function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [test, setTest] = useState<EyeTest | null>(null);
  const router = useRouter();

  useEffect(() => {
    const store = getStore();
    const found = store.eyeTests.find((e) => e.id === id);
    if (!found) { router.replace('/admin/eye-tests'); return; }
    setTest(found);
  }, [id, router]);

  if (!test) return null;

  const rows: [string, keyof typeof test.rightEye][] = [
    ['SPH', 'sph'], ['CYL', 'cyl'], ['AXIS', 'axis'], ['ADD', 'add'], ['PD', 'pd'],
  ];

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="adm-page-header">
        <Link href="/admin/eye-tests" className="adm-btn adm-btn-ghost adm-btn-sm">
          <ArrowLeft width={14} height={14} /> Eye Tests
        </Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">Prescription</div>
          <div className="adm-page-sub">{test.customerName} · {new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} className="adm-btn adm-btn-secondary adm-btn-sm">
            <Printer width={13} height={13} /> Print
          </button>
          <Link href={`/admin/pos?eyeTestId=${test.id}&customerId=${test.customerId}`} className="adm-btn adm-btn-primary adm-btn-sm">
            <ShoppingCart width={13} height={13} /> Start Sale
          </Link>
        </div>
      </div>

      <div className="adm-card">
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Prescription</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{test.customerName}</div>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>{test.customerPhone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Darshana Optical</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>Harur, Tamil Nadu</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Prescription Table */}
        <div style={{ padding: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>Eye</th>
                {rows.map(([label]) => (
                  <th key={label} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Right (OD)', data: test.rightEye, color: '#2563eb' },
                { label: 'Left (OS)', data: test.leftEye, color: '#dc2626' },
              ].map(({ label, data, color }) => (
                <tr key={label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 700, color, fontSize: 14 }}>{label}</td>
                  {rows.map(([, field]) => (
                    <td key={field} style={{ padding: '16px', textAlign: 'center', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {data[field] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* VA */}
          {(test.visualAcuityRight || test.visualAcuityLeft) && (
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <div><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>VA Right: </span><strong>{test.visualAcuityRight ?? '—'}</strong></div>
              <div><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>VA Left: </span><strong>{test.visualAcuityLeft ?? '—'}</strong></div>
            </div>
          )}

          {/* Recommendation */}
          {test.recommendation && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
              <div style={{ fontSize: 14, color: '#1e40af', fontWeight: 500 }}>{test.recommendation}</div>
            </div>
          )}

          {test.notes && (
            <div style={{ background: '#faf8f5', border: '1px solid #e6e6e8', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
              <div style={{ fontSize: 13.5, color: '#475569' }}>{test.notes}</div>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#94a3b8' }}>
            <span>Tested by: <strong style={{ color: '#475569' }}>{test.testedBy}</strong></span>
            <span>Darshana Optical — Harur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
