'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { auditSentence, canSeeMoney, initials, isAdmin, roleLabel, shortDate } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, Stepper } from '../_ui/parts';

type Tab = 'shop' | 'staff' | 'bills' | 'activity';
const LABELS: Record<Tab, string> = { shop: 'Shop details', staff: 'Staff', bills: 'Bills & tax', activity: 'Activity' };

export default function SettingsPage() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const { role } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const tabs: Tab[] = isAdmin(role) ? ['shop', 'staff', 'bills', 'activity'] : canSeeMoney(role) ? ['bills', 'activity'] : [];
  const tab = tabs.find((t) => t === params.get('tab')) ?? tabs[0];

  return (
    <>
      <PageHead title="Settings" />

      {tabs.length > 0 ? (
        <div role="tablist" aria-label="Settings" className={s.row} style={{ gap: 8 }}>
          {tabs.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={s.chip} onClick={() => router.replace(`/admin/simple/settings?tab=${t}`, { scroll: false })}>
              {LABELS[t]}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState>Shop settings are looked after by the owner. Ask them if something needs changing.</EmptyState>
      )}

      {tab === 'shop' && <ShopDetails />}
      {tab === 'staff' && <Staff />}
      {tab === 'bills' && <BillsAndTax canEdit={isAdmin(role)} />}
      {tab === 'activity' && <Activity />}

      <p style={{ margin: '8px 0 0' }}>
        <Link href="/admin/dashboard" style={{ fontSize: 16, fontWeight: 700 }}>
          Open full version →
        </Link>
        <span className={s.help} style={{ display: 'block', marginTop: 4 }}>
          The detailed screens with every option, for the rare jobs not covered here.
        </span>
      </p>
    </>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function useSettings() {
  return useAdminFetch<{ settings: Record<string, any> }>('/api/admin/settings');
}

function Saved({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p role="status" style={{ margin: 0, color: 'var(--success-text)', fontWeight: 700 }}>
      {text}
    </p>
  );
}

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 64,
        height: 36,
        flex: 'none',
        borderRadius: 999,
        border: 0,
        padding: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'var(--success)' : '#C9C7C0',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color .2s',
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={s.field}>
      {label}
      {children}
    </label>
  );
}

// ─── Shop details (admin) ─────────────────────────────────────────────────────

const SHOP_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: 'shop_name', label: 'Shop name' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'whatsapp', label: 'WhatsApp number', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'Town' },
  { key: 'pincode', label: 'PIN code' },
  { key: 'gst', label: 'GSTIN' },
  { key: 'opening_hours', label: 'Opening hours' },
  { key: 'logo_url', label: 'Logo' },
];

function ShopDetails() {
  const { data, error } = useSettings();
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState('');
  const values = form ?? Object.fromEntries(SHOP_FIELDS.map((f) => [f.key, String(data?.settings?.[f.key] ?? '')]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaveError('');
    setSaved('');
    try {
      await adminPut('/api/admin/settings', values);
      setSaved('Shop details saved.');
    } catch (err: any) {
      setSaveError(err.message ?? 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <EmptyState>{error ?? 'Loading…'}</EmptyState>;
  return (
    <form onSubmit={submit} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ShopLogo url={values.logo_url} onChange={(url) => setForm({ ...values, logo_url: url })} />
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {SHOP_FIELDS.filter((f) => f.key !== 'logo_url').map((f) => (
          <Field key={f.key} label={f.label}>
            <input className={s.input} type={f.type ?? 'text'} value={values[f.key]} onChange={(e) => setForm({ ...values, [f.key]: e.target.value })} />
          </Field>
        ))}
      </div>
      <ErrorNote>{saveError}</ErrorNote>
      <Saved text={saved} />
      <button type="submit" className={`${s.btn} ${s.btnPrimary}`} style={{ alignSelf: 'flex-start' }} disabled={busy}>
        {busy ? 'Saving…' : 'Save shop details'}
      </button>
    </form>
  );
}

/** Shop logo used on printed bills and prescriptions. Uploads through the existing image upload. */
function ShopLogo({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'The logo could not be uploaded.');
      onChange(json.url);
    } catch (err: any) {
      setError(err.message ?? 'The logo could not be uploaded.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={s.row} style={{ gap: 16 }}>
      <span style={{ position: 'relative', width: 96, height: 96, flex: 'none', borderRadius: 20, background: 'var(--page)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={url || '/logo.png'} alt="Shop logo" fill sizes="96px" style={{ objectFit: 'contain', padding: 10 }} unoptimized={/^https?:/.test(url)} />
      </span>
      <span className={s.stack} style={{ gap: 6 }}>
        <strong>Logo on printed bills</strong>
        <span className={s.help}>{url ? 'Your uploaded logo.' : 'Using the standard Darshana logo.'}</span>
        <span className={s.row} style={{ gap: 8 }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48 }} disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Uploading…' : url ? 'Change logo' : 'Upload logo'}
          </button>
          {url && (
            <button type="button" className={`${s.btn} ${s.btnLight}`} style={{ minHeight: 48 }} onClick={() => onChange('')}>
              Use standard logo
            </button>
          )}
        </span>
        <ErrorNote>{error}</ErrorNote>
      </span>
    </div>
  );
}

// ─── Staff (admin) ────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  last_active: string | null;
}

function Staff() {
  const { user } = useAuth();
  const { data, error, refetch } = useAdminFetch<{ staff: Member[] }>('/api/admin/staff');
  const settings = useSettings();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [adding, setAdding] = useState(false);
  const [caps, setCaps] = useState<{ staff: number; manager: number } | null>(null);
  const [capSaved, setCapSaved] = useState('');

  const current = caps ?? {
    staff: Number(settings.data?.settings?.max_discount_staff ?? 5),
    manager: Number(settings.data?.settings?.max_discount_manager ?? 15),
  };

  // Clear the "saved" note after a moment.
  useEffect(() => {
    if (!capSaved) return;
    const t = setTimeout(() => setCapSaved(''), 2500);
    return () => clearTimeout(t);
  }, [capSaved]);

  const setMoney = async (m: Member, on: boolean) => {
    setBusy(m.id);
    setActionError('');
    try {
      // The staff route bumps token_version on a role change, so the person's
      // next request already uses the new access level.
      await adminPut('/api/admin/staff', { id: m.id, role: on ? 'manager' : 'staff' });
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not change access.');
    } finally {
      setBusy(null);
    }
  };

  const saveCap = async (which: 'staff' | 'manager', value: number) => {
    const next = { ...current, [which]: value };
    setCaps(next);
    try {
      await adminPut('/api/admin/settings', { max_discount_staff: next.staff, max_discount_manager: next.manager });
      setCapSaved('Discount limits saved.');
    } catch (err: any) {
      setActionError(err.message ?? 'Could not save the discount limit.');
    }
  };

  return (
    <div className={s.stack} style={{ gap: 16 }}>
      <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 className={s.h3}>Biggest discount allowed</h2>
        <p className={s.help}>This limit applies to everyone with that access. The till refuses anything higher, even if someone tries to get around it.</p>
        <div className={s.row} style={{ gap: 24 }}>
          <span className={s.row} style={{ gap: 12 }}>
            <strong>Front desk</strong>
            <Stepper label="front desk discount limit" value={current.staff} min={0} max={100} onChange={(v) => saveCap('staff', v)} format={(v) => `${v}%`} />
          </span>
          <span className={s.row} style={{ gap: 12 }}>
            <strong>Can see money</strong>
            <Stepper label="manager discount limit" value={current.manager} min={0} max={100} onChange={(v) => saveCap('manager', v)} format={(v) => `${v}%`} />
          </span>
        </div>
        <Saved text={capSaved} />
      </section>

      <ErrorNote>{error || actionError}</ErrorNote>

      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {data?.staff.map((m) => (
          <div key={m.id} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: m.status === 'inactive' ? 0.6 : 1 }}>
            <div className={s.row} style={{ gap: 12, flexWrap: 'nowrap' }}>
              <span aria-hidden style={{ width: 48, height: 48, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials(m.name)}
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 18 }}>{m.name}</strong>
                <span className={s.muted} style={{ fontSize: 14, overflowWrap: 'anywhere' }}>
                  {roleLabel(m.role)}
                  {m.status === 'inactive' ? ' · switched off' : m.last_active ? ` · last in ${shortDate(m.last_active)}` : ''}
                </span>
              </span>
            </div>
            {m.role === 'admin' ? (
              <span className={s.help}>Owner — sees and changes everything.</span>
            ) : (
              <div className={s.row} style={{ justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 600 }}>Can see money</span>
                <Switch label={`${m.name} can see money`} checked={m.role === 'manager'} disabled={busy === m.id || m.id === user?.id} onChange={(v) => setMoney(m, v)} />
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <AddStaff
          onCancel={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void refetch();
          }}
        />
      ) : (
        <button type="button" className={`${s.btn} ${s.btnDashed}`} style={{ alignSelf: 'flex-start' }} onClick={() => setAdding(true)}>
          + Add a staff member
        </button>
      )}
    </div>
  );
}

function AddStaff({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [money, setMoney] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminPost('/api/admin/staff', { name: name.trim(), email: email.trim(), password, role: money ? 'manager' : 'staff' });
      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'Could not add them.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className={s.h3}>Add a staff member</h2>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <Field label="Name">
          <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
        </Field>
        <Field label="Email (they sign in with this)">
          <input className={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
        </Field>
        <Field label="First password">
          <input className={s.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </Field>
      </div>
      <div className={s.row} style={{ gap: 12 }}>
        <Switch label="Can see money" checked={money} onChange={setMoney} />
        <span>
          <strong>Can see money</strong>
          <span className={s.help} style={{ display: 'block' }}>
            Off: front desk only. On: also sees sales totals, Money and reports.
          </span>
        </span>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={busy}>
          {busy ? 'Saving…' : 'Add them'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Bills & tax ──────────────────────────────────────────────────────────────

function BillsAndTax({ canEdit }: { canEdit: boolean }) {
  const { data, error } = useSettings();
  const [form, setForm] = useState<{ tax_enabled: boolean; tax_rate: string; invoice_prefix: string; invoice_footer: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState('');

  const st = data?.settings;
  const v = form ?? {
    tax_enabled: Boolean(Number(st?.tax_enabled ?? 0)),
    tax_rate: String(Number(st?.tax_rate ?? 0)),
    invoice_prefix: String(st?.invoice_prefix ?? 'DO'),
    invoice_footer: String(st?.invoice_footer ?? ''),
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaveError('');
    setSaved('');
    try {
      await adminPut('/api/admin/settings', { ...v, tax_rate: Number(v.tax_rate) || 0 });
      setSaved('Bill settings saved.');
    } catch (err: any) {
      setSaveError(err.message ?? 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <EmptyState>{error ?? 'Loading…'}</EmptyState>;
  return (
    <form onSubmit={submit} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!canEdit && <p className={s.help}>Only the owner can change these.</p>}
      <div className={s.row} style={{ gap: 12 }}>
        <Switch label="Add GST to bills" checked={v.tax_enabled} disabled={!canEdit} onChange={(on) => setForm({ ...v, tax_enabled: on })} />
        <strong>Add GST to bills</strong>
      </div>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Field label="GST %">
          <input className={s.input} type="number" min={0} max={100} step="0.01" value={v.tax_rate} disabled={!canEdit || !v.tax_enabled} onChange={(e) => setForm({ ...v, tax_rate: e.target.value })} />
        </Field>
        <Field label="Bill number starts with">
          <input className={s.input} value={v.invoice_prefix} maxLength={10} disabled={!canEdit} onChange={(e) => setForm({ ...v, invoice_prefix: e.target.value.toUpperCase() })} />
        </Field>
      </div>
      <Field label="Note at the bottom of every bill">
        <textarea className={s.input} value={v.invoice_footer} maxLength={2000} disabled={!canEdit} onChange={(e) => setForm({ ...v, invoice_footer: e.target.value })} />
      </Field>
      <ErrorNote>{saveError}</ErrorNote>
      <Saved text={saved} />
      {canEdit && (
        <button type="submit" className={`${s.btn} ${s.btnPrimary}`} style={{ alignSelf: 'flex-start' }} disabled={busy}>
          {busy ? 'Saving…' : 'Save bill settings'}
        </button>
      )}
    </form>
  );
}

// ─── Activity ─────────────────────────────────────────────────────────────────

function Activity() {
  const { data, loading, error } = useAdminFetch<{ logs: { id: string; performed_by: string; details: string; created_at: string }[] }>('/api/admin/audit');
  const [shown, setShown] = useState(40);
  const logs = data?.logs ?? [];
  return (
    <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <span className={s.help}>Loading…</span>}
      {data && logs.length === 0 && <span className={s.help}>Nothing has happened yet.</span>}
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {logs.slice(0, shown).map((l) => (
          <li key={l.id} className={s.row} style={{ gap: 12, justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: 16 }}>{auditSentence(l)}</span>
            <span className={s.muted} style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
              {shortDate(l.created_at)}
            </span>
          </li>
        ))}
      </ol>
      {logs.length > shown && (
        <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ alignSelf: 'flex-start', marginTop: 10 }} onClick={() => setShown(shown + 40)}>
          Show more
        </button>
      )}
    </section>
  );
}
