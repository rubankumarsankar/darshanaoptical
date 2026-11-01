'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { Mail, Save } from 'lucide-react';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingsField({
  label,
  field,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  field: string;
  value: unknown;
  onChange: (field: string, value: string | number) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`settings-${field}`} style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{label}</label>
      <input
        id={`settings-${field}`}
        type={type}
        className="adm-input"
        placeholder={placeholder}
        value={String(value ?? '')}
        onChange={(event) => onChange(field, type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useAdminFetch<{ settings: any }>('/api/admin/settings');
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setErr(''); setOk('');
    try {
      await adminPut('/api/admin/settings', form);
      setOk('Settings saved successfully!');
      refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTestingEmail(true); setErr(''); setOk('');
    try {
      await adminPut('/api/admin/settings', form);
      const result = await adminPost<{ message: string; recipients: { to: string; cc: string | null; bcc: string | null } }>(
        '/api/admin/settings/test-email', {}
      );
      const copies = [result.recipients.cc && `CC: ${result.recipients.cc}`, result.recipients.bcc && `BCC: ${result.recipients.bcc}`].filter(Boolean);
      setOk(`${result.message} To: ${result.recipients.to}${copies.length ? `; ${copies.join('; ')}` : ''}`);
      await refetch();
    } catch (e: any) {
      setErr(e.message ?? 'Failed to send test email.');
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading settings…</div>;
  if (user?.role !== 'admin') {
    return <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>Admin access required.</div>;
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <SettingsField label={label} field={key} type={type} placeholder={placeholder} value={form[key]} onChange={set} />
  );

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Shop Settings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="adm-btn adm-btn-secondary" disabled={saving || testingEmail} onClick={handleTestEmail}>
            <Mail size={14} /> {testingEmail ? 'Sending test...' : 'Save & Send Test Email'}
          </button>
          <button className="adm-btn adm-btn-primary" disabled={saving || testingEmail} onClick={handleSave}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
      {err && <div style={{ color: '#ef4444', padding: 12, marginBottom: 12, background: '#fef2f2', borderRadius: 8 }}>{err}</div>}
      {ok && <div style={{ color: '#16a34a', padding: 12, marginBottom: 12, background: '#f0fdf4', borderRadius: 8 }}>{ok}</div>}

      <SettingsSection title="Shop Info">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          {field('Shop Name', 'shop_name')}
          {field('Tagline', 'tagline')}
          {field('Phone', 'phone')}
          {field('WhatsApp (with country code)', 'whatsapp', 'text', '918870571536')}
          {field('Email', 'email', 'email')}
          {field('GST Number', 'gst')}
          {field('Address', 'address')}
          {field('City', 'city')}
          {field('State', 'state')}
          {field('Pincode', 'pincode')}
        </div>
      </SettingsSection>

      <SettingsSection title="Email Notifications">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          {field('Send notifications to', 'notification_to', 'text', 'owner@example.com, manager@example.com')}
          {field('CC addresses', 'notification_cc', 'text', 'manager@example.com, staff@example.com')}
          {field('BCC addresses', 'notification_bcc', 'text', 'archive@example.com')}
        </div>
        <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: 12 }}>
          Use commas for multiple addresses. CC and BCC apply only to internal booking and inquiry notifications, not customer confirmations.
        </p>
      </SettingsSection>

      <SettingsSection title="Invoice Settings">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          {field('Invoice Prefix (e.g. DO)', 'invoice_prefix')}
          {field('Customer ID Prefix', 'customer_id_prefix')}
          {field('Low Stock Threshold', 'low_stock_threshold', 'number')}
          {field('Tax Rate %', 'tax_rate', 'number')}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Tax Enabled</label>
            <select className="adm-input" value={form.tax_enabled ? '1' : '0'} onChange={(e) => set('tax_enabled', e.target.value === '1')}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>
        <div className="adm-grid-2" style={{ gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Invoice Footer</label>
            <textarea className="adm-input" rows={2} value={form.invoice_footer ?? ''} onChange={(e) => set('invoice_footer', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Invoice Terms</label>
            <textarea className="adm-input" rows={2} value={form.invoice_terms ?? ''} onChange={(e) => set('invoice_terms', e.target.value)} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Discount Limits by Role">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          {field('Admin max discount %', 'max_discount_admin', 'number')}
          {field('Manager max discount %', 'max_discount_manager', 'number')}
          {field('Staff max discount %', 'max_discount_staff', 'number')}
        </div>
      </SettingsSection>
    </div>
  );
}
