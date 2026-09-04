'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Customer, EyeEntry } from '@/app/lib/admin/types';
import { ArrowLeft, Save, Search } from 'lucide-react';

function EyeTestForm() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const preCustomerId = params.get('customerId') ?? '';
  const preCustomerName = params.get('customerName') ?? '';

  const [customerSearch, setCustomerSearch] = useState(preCustomerName);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [right, setRight] = useState<EyeEntry>({ sph: '', cyl: '', axis: '', add: '', pd: '' });
  const [left, setLeft] = useState<EyeEntry>({ sph: '', cyl: '', axis: '', add: '', pd: '' });
  const [vaRight, setVaRight] = useState('');
  const [vaLeft, setVaLeft] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preCustomerId) {
      const store = getStore();
      const c = store.customers.find((c) => c.id === preCustomerId);
      if (c) setSelectedCustomer(c);
    }
  }, [preCustomerId]);

  useEffect(() => {
    if (!customerSearch.trim() || selectedCustomer) { setSearchResults([]); return; }
    const q = customerSearch.toLowerCase();
    const store = getStore();
    setSearchResults(store.customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5));
  }, [customerSearch, selectedCustomer]);

  const setEye = (side: 'right' | 'left', field: keyof EyeEntry, val: string) => {
    if (side === 'right') setRight((r) => ({ ...r, [field]: val }));
    else setLeft((l) => ({ ...l, [field]: val }));
  };

  const handleSave = async () => {
    if (!selectedCustomer) { alert('Please select a customer first.'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const store = getStore();
    const newTest = {
      id: generateId('et'),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      date,
      testedBy: user?.name ?? 'Unknown',
      rightEye: right,
      leftEye: left,
      visualAcuityRight: vaRight || undefined,
      visualAcuityLeft: vaLeft || undefined,
      recommendation: recommendation || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    store.eyeTests.push(newTest);
    // Update customer last visit
    const ci = store.customers.findIndex((c) => c.id === selectedCustomer.id);
    if (ci !== -1) store.customers[ci].lastVisit = new Date().toISOString();
    saveStore(store);
    setSaving(false);
    router.push(`/admin/prescriptions/${newTest.id}`);
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="adm-page-header">
        <Link href="/admin/eye-tests" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft width={14} height={14} /> Eye Tests</Link>
        <div className="adm-page-title">New Eye Test</div>
      </div>

      {/* Customer Selection */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-card-header"><span className="adm-card-title">Select Customer</span></div>
        <div className="adm-card-body">
          {selectedCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedCustomer.phone} · {selectedCustomer.customerId}</div>
              </div>
              <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="adm-btn adm-btn-secondary adm-btn-sm">Change</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className="adm-search-wrap">
                <Search />
                <input className="adm-input" placeholder="Search customer by name or phone…" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
              </div>
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, marginTop: 4, overflow: 'hidden' }}>
                  {searchResults.map((c) => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setSearchResults([]); }}
                      style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f5f9', fontFamily: 'inherit' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date & Tester */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-card-body">
          <div className="adm-grid-2">
            <div className="adm-field">
              <label className="adm-label">Test Date</label>
              <input className="adm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Tested By</label>
              <input className="adm-input" value={user?.name ?? ''} readOnly style={{ background: '#f8fafc', color: '#64748b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Prescription */}
      {(['right', 'left'] as const).map((side) => {
        const data = side === 'right' ? right : left;
        const label = side === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)';
        return (
          <div key={side} className="adm-card" style={{ marginBottom: 16 }}>
            <div className="adm-card-header">
              <span style={{ fontSize: 10, background: side === 'right' ? '#eff6ff' : '#fef2f2', color: side === 'right' ? '#2563eb' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{side === 'right' ? 'OD' : 'OS'}</span>
              <span className="adm-card-title">{label}</span>
            </div>
            <div className="adm-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {[['SPH', 'sph'], ['CYL', 'cyl'], ['AXIS', 'axis'], ['ADD', 'add'], ['PD', 'pd']].map(([lbl, field]) => (
                  <div key={field} className="adm-field">
                    <label className="adm-label" style={{ textAlign: 'center' }}>{lbl}</label>
                    <input
                      className="adm-input"
                      style={{ textAlign: 'center' }}
                      placeholder={field === 'axis' ? '0-180' : field === 'pd' ? 'mm' : '0.00'}
                      value={data[field as keyof EyeEntry] ?? ''}
                      onChange={(e) => setEye(side, field as keyof EyeEntry, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Visual Acuity & Notes */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-card-header"><span className="adm-card-title">Visual Acuity & Notes</span></div>
        <div className="adm-card-body">
          <div className="adm-grid-2" style={{ marginBottom: 16 }}>
            <div className="adm-field">
              <label className="adm-label">VA Right Eye</label>
              <input className="adm-input" placeholder="e.g. 6/6" value={vaRight} onChange={(e) => setVaRight(e.target.value)} />
            </div>
            <div className="adm-field">
              <label className="adm-label">VA Left Eye</label>
              <input className="adm-input" placeholder="e.g. 6/9" value={vaLeft} onChange={(e) => setVaLeft(e.target.value)} />
            </div>
          </div>
          <div className="adm-field" style={{ marginBottom: 12 }}>
            <label className="adm-label">Recommendation</label>
            <input className="adm-input" placeholder="e.g. Progressive lenses with AR coating" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Notes</label>
            <textarea className="adm-textarea" placeholder="Additional observations…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Link href="/admin/eye-tests" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button onClick={handleSave} className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : <><Save width={14} height={14} /> Save Prescription</>}
        </button>
      </div>
    </div>
  );
}

export default function NewEyeTestPage() {
  return (
    <Suspense>
      <EyeTestForm />
    </Suspense>
  );
}
