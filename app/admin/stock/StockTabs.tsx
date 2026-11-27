'use client';

import { useState, type FormEvent } from 'react';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { inr, shortDate, telLink, waLink } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, StatusTag } from '../_ui/parts';

// ─── Deliveries (purchase history) ────────────────────────────────────────────

interface Purchase {
  id: string;
  purchase_number: string;
  supplier_name: string;
  supplier_bill_number: string | null;
  total: string;
  paid: string;
  balance: string;
  status: 'paid' | 'partially_paid' | 'pending';
  created_at: string;
  created_by: string;
  items: { id: string; product_name: string; quantity: number; purchase_price: string; total: string }[];
}

export function Deliveries() {
  const { data, loading, error } = useAdminFetch<{ purchases: Purchase[] }>('/api/admin/purchases');
  const [open, setOpen] = useState<string | null>(null);
  const list = data?.purchases ?? [];
  return (
    <div className={s.stack} style={{ gap: 10 }}>
      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <EmptyState>Loading deliveries…</EmptyState>}
      {data && list.length === 0 && <EmptyState>No deliveries recorded yet.</EmptyState>}
      {list.map((p) => {
        const owe = Number(p.balance);
        return (
          <div key={p.id} className={s.cardTight} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              aria-expanded={open === p.id}
              onClick={() => setOpen(open === p.id ? null : p.id)}
              className={s.row}
              style={{ gap: 14, border: 0, background: 'transparent', font: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0, color: 'var(--ink)' }}
            >
              <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 18 }}>{p.supplier_name}</strong>
                <span className={s.muted} style={{ fontSize: 15 }}>
                  {p.purchase_number} · {shortDate(p.created_at)} · {p.items.length} item{p.items.length === 1 ? '' : 's'}
                  {p.supplier_bill_number ? ` · their bill ${p.supplier_bill_number}` : ''}
                </span>
              </span>
              <strong style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{inr(p.total)}</strong>
              {owe > 0 ? <StatusTag tone="orange">You owe {inr(owe)}</StatusTag> : <StatusTag tone="good">Paid</StatusTag>}
            </button>
            {open === p.id && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.items.map((i) => (
                  <li key={i.id} className={s.row} style={{ justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'var(--page)' }}>
                    <span>
                      {i.product_name} × {i.quantity} <span className={s.muted}>at {inr(i.purchase_price)}</span>
                    </span>
                    <strong>{inr(i.total)}</strong>
                  </li>
                ))}
                <li className={s.help}>Recorded by {p.created_by}</li>
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  gst: string | null;
  balance: string;
  status: 'active' | 'inactive';
}

export function Suppliers() {
  const { data, loading, error, refetch } = useAdminFetch<{ suppliers: Supplier[] }>('/api/admin/suppliers');
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null);
  const list = data?.suppliers ?? [];
  return (
    <div className={s.stack} style={{ gap: 12 }}>
      {editing ? (
        <SupplierForm
          key={editing === 'new' ? 'new' : editing.id}
          supplier={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refetch();
          }}
        />
      ) : (
        <button type="button" className={`${s.btn} ${s.btnDark}`} style={{ alignSelf: 'flex-start' }} onClick={() => setEditing('new')}>
          + New supplier
        </button>
      )}
      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <EmptyState>Loading suppliers…</EmptyState>}
      {data && list.length === 0 && <EmptyState>No suppliers yet.</EmptyState>}
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}>
        {list.map((sp) => {
          const tel = telLink(sp.phone);
          const wa = waLink(sp.phone, `Hello ${sp.name}, this is Darshana Optical.`);
          return (
            <div key={sp.id} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: sp.status === 'inactive' ? 0.6 : 1 }}>
              <div>
                <strong style={{ display: 'block', fontSize: 19 }}>{sp.name}</strong>
                <span className={s.muted} style={{ fontSize: 15 }}>
                  {[sp.contact_person, sp.phone].filter(Boolean).join(' · ')}
                  {sp.status === 'inactive' ? ' · switched off' : ''}
                </span>
              </div>
              {Number(sp.balance) > 0 ? <StatusTag tone="orange">You owe {inr(sp.balance)}</StatusTag> : <StatusTag tone="good">Nothing owed</StatusTag>}
              <div className={s.row} style={{ gap: 8 }}>
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} style={{ minHeight: 48 }}>
                    WhatsApp
                  </a>
                )}
                {tel && (
                  <a href={tel} className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48 }} aria-label={`Call ${sp.name}`}>
                    Call
                  </a>
                )}
                <button type="button" className={`${s.btn} ${s.btnLight}`} style={{ minHeight: 48 }} onClick={() => setEditing(sp)} aria-label={`Change ${sp.name}`}>
                  Change
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupplierForm({ supplier, onSaved, onCancel }: { supplier?: Supplier; onSaved: () => void; onCancel: () => void }) {
  const [v, setV] = useState({
    name: supplier?.name ?? '',
    contact_person: supplier?.contact_person ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    gst: supplier?.gst ?? '',
  });
  const [active, setActive] = useState(supplier?.status !== 'inactive');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      name: v.name.trim(),
      contact_person: v.contact_person.trim() || null,
      phone: v.phone.trim(),
      email: v.email.trim(),
      address: v.address.trim() || null,
      gst: v.gst.trim() || null,
    };
    try {
      if (supplier) await adminPut(`/api/admin/suppliers/${encodeURIComponent(supplier.id)}`, { ...body, status: active ? 'active' : 'inactive' });
      else await adminPost('/api/admin/suppliers', body);
      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'The supplier could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const optional = <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>;
  return (
    <form onSubmit={submit} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className={s.h3} style={{ fontSize: 20 }}>
        {supplier ? `Change ${supplier.name}` : 'New supplier'}
      </h2>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
        <label className={s.field}>
          Name
          <input className={s.input} value={v.name} onChange={set('name')} required maxLength={255} />
        </label>
        <label className={s.field}>
          Phone
          <input className={s.input} type="tel" value={v.phone} onChange={set('phone')} required maxLength={20} />
        </label>
        <label className={s.field}>
          <span>Contact person {optional}</span>
          <input className={s.input} value={v.contact_person} onChange={set('contact_person')} maxLength={255} />
        </label>
        <label className={s.field}>
          <span>Email {optional}</span>
          <input className={s.input} type="email" value={v.email} onChange={set('email')} maxLength={255} />
        </label>
        <label className={s.field}>
          <span>Address {optional}</span>
          <input className={s.input} value={v.address} onChange={set('address')} maxLength={1000} />
        </label>
        <label className={s.field}>
          <span>GSTIN {optional}</span>
          <input className={s.input} value={v.gst} onChange={set('gst')} maxLength={20} />
        </label>
      </div>
      {supplier && (
        <label className={s.row} style={{ gap: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={!active} onChange={(e) => setActive(!e.target.checked)} style={{ width: 24, height: 24 }} />
          We don’t buy from them any more
        </label>
      )}
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnDark}`} disabled={busy}>
          {busy ? 'Saving…' : 'Save supplier'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── History (stock movements this month) ─────────────────────────────────────

interface Movement {
  id: string;
  product_name: string;
  type: 'purchase' | 'sale' | 'damage' | 'return' | 'adjustment';
  quantity: number;
  reason: string | null;
  created_by: string;
  created_at: string;
}

const MOVE_WORDS: Record<Movement['type'], string> = {
  purchase: 'Delivered',
  sale: 'Sold',
  damage: 'Damaged',
  return: 'Returned',
  adjustment: 'Recounted',
};

export function History() {
  const { data, loading, error } = useAdminFetch<{ movements: Movement[] }>('/api/admin/inventory');
  const list = data?.movements ?? [];
  return (
    <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p className={s.help}>Every change to stock this month, newest first.</p>
      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <span className={s.help}>Loading…</span>}
      {data && list.length === 0 && <span className={s.help}>Nothing has moved this month.</span>}
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {list.map((m) => (
          <li key={m.id} className={s.row} style={{ gap: 12, justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)', flexWrap: 'nowrap' }}>
            <span style={{ minWidth: 0 }}>
              <strong>
                {MOVE_WORDS[m.type] ?? m.type} {Math.abs(m.quantity)} × {m.product_name}
              </strong>
              <span className={s.muted} style={{ display: 'block', fontSize: 14 }}>
                {m.reason ? `${m.reason} · ` : ''}by {m.created_by}
              </span>
            </span>
            <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <strong style={{ color: m.quantity < 0 ? 'var(--danger)' : 'var(--success-text)' }}>
                {m.quantity > 0 ? '+' : ''}
                {m.quantity}
              </strong>
              <span className={s.muted} style={{ display: 'block', fontSize: 14 }}>
                {shortDate(m.created_at)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
