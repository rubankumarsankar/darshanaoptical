'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStore, saveStore, generateId, nextCustomerId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewCustomerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', phone: '', email: '', dob: '', gender: '', address: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Customer name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const store = getStore();
    const newCustomer = {
      id: generateId('cust'),
      customerId: nextCustomerId(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      dob: form.dob || undefined,
      gender: (form.gender as 'male' | 'female' | 'other') || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };

    store.customers.unshift(newCustomer);
    store.auditLogs.unshift({
      id: generateId('al'),
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: newCustomer.id,
      details: `New customer created: ${newCustomer.name} (${newCustomer.phone})`,
      performedBy: user?.name ?? 'Unknown',
      performedByRole: user?.role ?? 'staff',
      createdAt: new Date().toISOString(),
    });
    saveStore(store);

    setSaving(false);
    router.push(`/admin/customers/${newCustomer.id}`);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="adm-page-header">
        <Link href="/admin/customers" className="adm-btn adm-btn-ghost adm-btn-sm">
          <ArrowLeft width={14} height={14} /> Back
        </Link>
        <div>
          <div className="adm-page-title">New Customer</div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Customer Details</span>
        </div>
        <form onSubmit={handleSubmit} className="adm-card-body">
          <div className="adm-grid-2" style={{ gap: 16 }}>
            <Field label="Full Name *" error={errors.name}>
              <input className="adm-input" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Phone Number *" error={errors.phone}>
              <input className="adm-input" placeholder="10-digit mobile" value={form.phone} onChange={(e) => set('phone', e.target.value)} maxLength={10} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="adm-input" type="email" placeholder="Optional" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Date of Birth">
              <input className="adm-input" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Gender">
              <select className="adm-select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>

          <div className="adm-divider" />

          <Field label="Address">
            <input className="adm-input" placeholder="Street, area, pincode" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>

          <div style={{ marginTop: 16 }}>
            <Field label="Notes">
              <textarea className="adm-textarea" placeholder="Any special notes (allergies, preferences, etc.)" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Link href="/admin/customers" className="adm-btn adm-btn-secondary">Cancel</Link>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : <><Save width={14} height={14} /> Save Customer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      {children}
      {error && <span style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>{error}</span>}
    </div>
  );
}
