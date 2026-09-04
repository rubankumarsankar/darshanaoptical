'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStore, saveStore } from '@/app/lib/admin/store';
import type { Customer, EyeTest, Invoice } from '@/app/lib/admin/types';
import {
  ArrowLeft, Eye, ShoppingCart, Phone, Mail, MapPin, Calendar, Edit2, Save, X,
  Receipt, FileText, CreditCard,
} from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<'overview' | 'eyetests' | 'orders' | 'payments'>('overview');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [eyeTests, setEyeTests] = useState<EyeTest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const router = useRouter();

  useEffect(() => {
    const store = getStore();
    const c = store.customers.find((c) => c.id === id);
    if (!c) { router.replace('/admin/customers'); return; }
    setCustomer(c);
    setEditForm(c);
    setEyeTests(store.eyeTests.filter((e) => e.customerId === id));
    setInvoices(store.invoices.filter((i) => i.customerId === id));
  }, [id, router]);

  const saveEdit = () => {
    if (!customer) return;
    const store = getStore();
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const updated = { ...customer, ...editForm };
    store.customers[idx] = updated;
    saveStore(store);
    setCustomer(updated);
    setEditing(false);
  };

  if (!customer) return null;

  const totalSpent = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = invoices.reduce((s, i) => s + i.balance, 0);

  return (
    <div>
      <div className="adm-page-header">
        <Link href="/admin/customers" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft width={14} height={14} /> Customers</Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">{customer.name}</div>
          <div className="adm-page-sub">{customer.customerId}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/admin/eye-tests/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`} className="adm-btn adm-btn-secondary adm-btn-sm">
            <Eye width={13} height={13} /> Eye Test
          </Link>
          <Link href={`/admin/pos?customerId=${customer.id}`} className="adm-btn adm-btn-primary adm-btn-sm">
            <ShoppingCart width={13} height={13} /> New Sale
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left — Profile Card */}
        <div>
          <div className="adm-card">
            <div className="adm-card-body" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#fc5a061a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fc5a06', fontWeight: 800, fontSize: 24, margin: '0 auto 14px',
              }}>
                {customer.name.charAt(0)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{customer.name}</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>{customer.customerId}</div>
              <span className={`adm-badge ${customer.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`} style={{ marginTop: 10 }}>
                {customer.status}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow icon={<Phone width={13} height={13} />} label={customer.phone} />
              {customer.email && <InfoRow icon={<Mail width={13} height={13} />} label={customer.email} />}
              {customer.address && <InfoRow icon={<MapPin width={13} height={13} />} label={customer.address} />}
              {customer.dob && <InfoRow icon={<Calendar width={13} height={13} />} label={`DOB: ${fmtDate(customer.dob)}`} />}
              {customer.gender && <InfoRow icon={<span style={{ width: 13 }}>⚧</span>} label={customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)} />}
              {customer.notes && (
                <div style={{ background: '#faf8f5', border: '1px solid #e6e6e8', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                  📝 {customer.notes}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setEditing(true)} className="adm-btn adm-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Edit2 width={13} height={13} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="adm-card" style={{ marginTop: 12 }}>
            <div className="adm-card-header">
              <span className="adm-card-title">Financials</span>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SummaryRow label="Total Invoices" value={String(invoices.length)} />
              <SummaryRow label="Total Spent" value={fmt(totalSpent)} color="#0f172a" />
              <SummaryRow label="Total Paid" value={fmt(totalPaid)} color="#16a34a" />
              {totalBalance > 0 && <SummaryRow label="Outstanding" value={fmt(totalBalance)} color="#d97706" />}
            </div>
          </div>
        </div>

        {/* Right — Tabs */}
        <div>
          <div className="adm-tabs" style={{ marginBottom: 16 }}>
            {(['overview', 'eyetests', 'orders', 'payments'] as const).map((t) => (
              <button key={t} className={`adm-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'eyetests' ? 'Eye Tests' : t === 'overview' ? 'Overview' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Latest Prescription</span></div>
              {eyeTests.length > 0 ? (
                <div className="adm-card-body">
                  <PrescriptionDisplay test={eyeTests[eyeTests.length - 1]} />
                </div>
              ) : (
                <div className="adm-card-body">
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>No prescriptions on record</div>
                  <Link href={`/admin/eye-tests/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`} className="adm-btn adm-btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                    <Eye width={14} height={14} /> Start Eye Test
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === 'eyetests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {eyeTests.length === 0 && (
                <div className="adm-card">
                  <div className="adm-card-body adm-empty">No eye tests recorded.</div>
                </div>
              )}
              {eyeTests.slice().reverse().map((et) => (
                <div key={et.id} className="adm-card">
                  <div className="adm-card-header">
                    <Eye width={14} height={14} style={{ color: '#2563eb' }} />
                    <span className="adm-card-title">Eye Test — {fmtDate(et.date)}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>by {et.testedBy}</span>
                  </div>
                  <div className="adm-card-body">
                    <PrescriptionDisplay test={et} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Invoice #</th><th>Items</th><th>Total</th><th>Status</th><th>Order</th><th>Date</th></tr></thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No invoices yet</td></tr>
                  ) : (
                    invoices.slice().reverse().map((inv) => (
                      <tr key={inv.id}>
                        <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 600, textDecoration: 'none' }}>{inv.invoiceNumber}</Link></td>
                        <td style={{ color: '#64748b' }}>{inv.items.map((i) => i.productName).join(', ')}</td>
                        <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                        <td><InvBadge status={inv.status} /></td>
                        <td>{inv.orderStatus ? <InvBadge status={inv.orderStatus} /> : '—'}</td>
                        <td style={{ color: '#94a3b8', fontSize: 12.5 }}>{fmtDate(inv.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'payments' && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance</th><th>Last Payment</th></tr></thead>
                <tbody>
                  {invoices.filter((i) => i.payments.length > 0 || i.balance > 0).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No payment records</td></tr>
                  ) : (
                    invoices.slice().reverse().map((inv) => (
                      <tr key={inv.id}>
                        <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 600, textDecoration: 'none' }}>{inv.invoiceNumber}</Link></td>
                        <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                        <td style={{ color: inv.balance > 0 ? '#d97706' : '#94a3b8', fontWeight: inv.balance > 0 ? 700 : 400 }}>
                          {inv.balance > 0 ? fmt(inv.balance) : '—'}
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: 12.5 }}>
                          {inv.payments.length > 0
                            ? fmtDate(inv.payments[inv.payments.length - 1].date)
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="adm-overlay" onClick={() => setEditing(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Edit Customer</span>
              <button onClick={() => setEditing(false)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full Name', field: 'name', type: 'text' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Address', field: 'address', type: 'text' },
                { label: 'Notes', field: 'notes', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field} className="adm-field">
                  <label className="adm-label">{label}</label>
                  <input
                    className="adm-input"
                    type={type}
                    value={(editForm as Record<string, string>)[field] ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setEditing(false)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={saveEdit} className="adm-btn adm-btn-primary"><Save width={13} height={13} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#475569', fontSize: 13 }}>
      <span style={{ marginTop: 1, flexShrink: 0, color: '#94a3b8' }}>{icon}</span>
      {label}
    </div>
  );
}

function SummaryRow({ label, value, color = '#64748b' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function PrescriptionDisplay({ test }: { test: EyeTest }) {
  const rows = [
    { eye: 'Right Eye (OD)', data: test.rightEye },
    { eye: 'Left Eye (OS)', data: test.leftEye },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {rows.map(({ eye, data }) => (
          <div key={eye} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{eye}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {[['SPH', data.sph], ['CYL', data.cyl], ['AXIS', data.axis], ['ADD', data.add ?? '—'], ['PD', data.pd ?? '—']].map(([k, v]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {test.recommendation && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1e40af' }}>
          💡 {test.recommendation}
        </div>
      )}
    </div>
  );
}

const STATUS_MAP: Record<string, [string, string]> = {
  paid: ['Paid', 'adm-badge-success'], partially_paid: ['Part Paid', 'adm-badge-warning'],
  pending: ['Pending', 'adm-badge-danger'], cancelled: ['Cancelled', 'adm-badge-gray'],
  new: ['New', 'adm-badge-info'], lens_ordered: ['Lens Ordered', 'adm-badge-orange'],
  in_process: ['In Process', 'adm-badge-warning'], ready: ['Ready', 'adm-badge-success'],
  delivered: ['Delivered', 'adm-badge-gray'],
};
function InvBadge({ status }: { status: string }) {
  const [label, cls] = STATUS_MAP[status] ?? [status, 'adm-badge-gray'];
  return <span className={`adm-badge ${cls}`}>{label}</span>;
}
