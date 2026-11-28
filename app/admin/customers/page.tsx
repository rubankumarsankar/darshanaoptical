'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, MessageCircle, Phone, Plus, Printer, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { adminDelete, adminPut } from '@/app/lib/admin/api';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { initials, inr, isAdmin, shortDate, telLink, waLink } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';
import NewCustomerForm from '../_ui/NewCustomerForm';

interface Row {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  last_visit: string | null;
  owed: number;
}

interface Detail {
  customer: { id: string; customer_id: string; name: string; phone: string; email: string | null; address: string | null; notes: string | null; last_visit: string | null };
  eyeTests: { id: string; test_date: string; re_sph: string | null; re_cyl: string | null; re_axis: string | null; le_sph: string | null; le_cyl: string | null; le_axis: string | null; recommendation: string | null }[];
  invoices: { id: string; invoice_number: string; total: string; balance: string; status: string; created_at: string }[];
}

const power = (sph: string | null, cyl: string | null, axis: string | null) => [sph, cyl && `${cyl}${axis ? ` × ${axis}` : ''}`].filter(Boolean).join(' / ') || '—';

export default function CustomersPage() {
  return (
    <Suspense>
      <Customers />
    </Suspense>
  );
}

function Customers() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [debounced, setDebounced] = useState(q);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const detailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading, error, refetch } = useAdminFetch<{ customers: Row[] }>('/api/admin/simple/customers', { params: { q: debounced } });
  const list = data?.customers ?? [];

  const open = (id: string) => {
    setSelected(id);
    // On phones the panel is below the list.
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      <PageHead title="Customers">
        <span className={s.row} style={{ gap: 10 }}>
          <Link href="/admin/bills" className={`${s.btn} ${s.btnLight}`}>
            Find a bill
          </Link>
          {!adding && (
            <button type="button" className={`${s.btn} ${s.btnDark}`} onClick={() => setAdding(true)}>
              + Add customer
            </button>
          )}
        </span>
      </PageHead>

      {adding && (
        <div className={s.card}>
          <NewCustomerForm
            initial={q}
            onCancel={() => setAdding(false)}
            onCreated={(c) => {
              setAdding(false);
              setQ(c.phone);
              setDebounced(c.phone);
              open(c.id);
            }}
          />
        </div>
      )}

      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label className={s.search}>
          <Search size={22} color="#5E606A" aria-hidden />
          <span className={s.srOnly}>Find a customer</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a customer by name or phone" autoFocus />
        </label>
      </form>

      <ErrorNote>{error}</ErrorNote>

      <div className={s.row} style={{ alignItems: 'flex-start', gap: 20 }}>
        <ul aria-label="Customers" className={s.stack} style={{ flex: '3 1 240px', gap: 10, margin: 0, padding: 0, listStyle: 'none', minWidth: 0 }}>
          {loading && !data && <EmptyState>Loading…</EmptyState>}
          {data && list.length === 0 && <EmptyState>{debounced ? `No one found for “${debounced}”.` : 'No customers yet.'}</EmptyState>}
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" className={s.choice} aria-pressed={selected === c.id} onClick={() => open(c.id)} style={{ width: '100%', background: selected === c.id ? undefined : 'var(--card)', boxShadow: 'var(--shadow)' }}>
                <span aria-hidden style={{ width: 48, height: 48, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {initials(c.name)}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className={s.choiceTitle}>{c.name}</span>
                  <span className={s.choiceSub}>
                    {c.phone}
                    {c.last_visit ? ` · Last visit ${shortDate(c.last_visit)}` : ''}
                  </span>
                </span>
                {c.owed > 0 && <StatusTag tone="orange">Owes {inr(c.owed)}</StatusTag>}
              </button>
            </li>
          ))}
        </ul>

        <section ref={detailRef} aria-label="Customer details" style={{ flex: '7 1 560px', minWidth: 0, scrollMarginTop: 16 }}>
          {selected ? (
            <CustomerDetail
              key={selected}
              id={selected}
              owed={list.find((c) => c.id === selected)?.owed ?? 0}
              onPay={(id) => router.push(`/admin/take-payment?customer=${encodeURIComponent(id)}`)}
              onChanged={(removed) => {
                void refetch();
                if (removed) setSelected(null);
              }}
            />
          ) : (
            <EmptyState>Pick a customer to see their eye power and bills.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}

function CustomerDetail({ id, owed, onPay, onChanged }: { id: string; owed: number; onPay: (id: string) => void; onChanged: (removed?: boolean) => void }) {
  const { role } = useAuth();
  const { data, loading, error, refetch } = useAdminFetch<Detail>(`/api/admin/customers/${encodeURIComponent(id)}`);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [allTests, setAllTests] = useState(false);
  if (loading || !data) return <EmptyState>{error ? `Couldn’t load: ${error}` : 'Loading…'}</EmptyState>;
  const { customer, eyeTests, invoices } = data;
  const last = eyeTests[0];
  const tel = telLink(customer.phone);
  const wa = waLink(customer.phone, `Hello ${customer.name}, this is Darshana Optical.`);
  const big = { flex: '1 1 140px' } as const;

  const remove = async () => {
    setRemoveError('');
    try {
      await adminDelete(`/api/admin/customers/${encodeURIComponent(customer.id)}`);
      onChanged(true);
    } catch (err: any) {
      setRemoveError(err.message ?? 'Could not remove them.');
    }
  };

  if (editing) {
    return (
      <EditCustomer
        customer={customer}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          void refetch();
          onChanged();
        }}
      />
    );
  }

  return (
    <div className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className={s.row} style={{ justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <h2 className={s.h2}>{customer.name}</h2>
          <p className={s.sub}>
            {customer.phone} · {customer.customer_id}
            {customer.email ? ` · ${customer.email}` : ''}
          </p>
          {customer.address && <p className={s.help}>{customer.address}</p>}
          {customer.notes && <p className={s.help}>Note: {customer.notes}</p>}
        </div>
        <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48 }} onClick={() => setEditing(true)}>
          Change details
        </button>
      </div>

      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <Link href={`/admin/sale?customer=${encodeURIComponent(customer.id)}`} className={`${s.btn} ${s.btnPrimary}`} style={big}>
          <Plus size={20} aria-hidden /> New sale
        </Link>
        <Link href={`/admin/eye-test?customer=${encodeURIComponent(customer.id)}`} className={`${s.btn} ${s.btnDark}`} style={big}>
          <Eye size={20} aria-hidden /> Eye test
        </Link>
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} style={big}>
            <MessageCircle size={20} aria-hidden /> WhatsApp
          </a>
        )}
        {tel && (
          <a href={tel} className={`${s.btn} ${s.btnSoft}`} style={big}>
            <Phone size={20} aria-hidden /> Call
          </a>
        )}
      </div>

      {owed > 0 && (
        <div className={s.row} style={{ justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderRadius: 20, background: 'var(--soft-orange)' }}>
          <span style={{ fontSize: 17 }}>
            Still to pay: <strong>{inr(owed)}</strong>
          </span>
          <button type="button" className={`${s.btn} ${s.btnDark}`} onClick={() => onPay(customer.id)}>
            Take payment
          </button>
        </div>
      )}

      <div className={s.stack} style={{ gap: 10 }}>
        <h3 className={s.h3}>Latest eye power</h3>
        {last ? (
          <>
            <div className={s.grid} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {[
                ['Right', power(last.re_sph, last.re_cyl, last.re_axis)],
                ['Left', power(last.le_sph, last.le_cyl, last.le_axis)],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: 16, borderRadius: 18, background: 'var(--page)' }}>
                  <span className={s.muted} style={{ fontSize: 14 }}>
                    {label} eye
                  </span>
                  <strong style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 22 }}>{value}</strong>
                </div>
              ))}
            </div>
            <span className={s.help}>
              Tested {shortDate(last.test_date)}
              {last.recommendation ? ` · ${last.recommendation}` : ''}
            </span>
          </>
        ) : (
          <span className={s.help}>No eye test yet.</span>
        )}
      </div>

      {eyeTests.length > 0 && (
        <div className={s.stack} style={{ gap: 10 }}>
          <h3 className={s.h3}>All eye tests</h3>
          {(allTests ? eyeTests : eyeTests.slice(0, 3)).map((t) => (
            <div key={t.id} className={s.row} style={{ justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 16, background: 'var(--page)' }}>
              <span style={{ minWidth: 0 }}>
                <strong>{shortDate(t.test_date)}</strong>
                <span className={s.muted} style={{ display: 'block', fontSize: 14 }}>
                  Right {power(t.re_sph, t.re_cyl, t.re_axis)} · Left {power(t.le_sph, t.le_cyl, t.le_axis)}
                </span>
              </span>
              <Link href={`/admin/prescriptions/${encodeURIComponent(t.id)}?print=1`} className={`${s.btn} ${s.btnLight}`} style={{ minHeight: 48 }}>
                <Printer size={18} aria-hidden /> Print
              </Link>
            </div>
          ))}
          {eyeTests.length > 3 && (
            <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ alignSelf: 'flex-start', minHeight: 48 }} onClick={() => setAllTests((v) => !v)}>
              {allTests ? 'Show fewer' : `Show all ${eyeTests.length}`}
            </button>
          )}
        </div>
      )}

      <div className={s.stack} style={{ gap: 10 }}>
        <h3 className={s.h3}>Recent bills</h3>
        {invoices.length === 0 && <span className={s.help}>No bills yet.</span>}
        {invoices.slice(0, 5).map((inv) => (
          <Link key={inv.id} href={`/admin/bills/${encodeURIComponent(inv.invoice_number.toLowerCase())}`} className={s.row} style={{ justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 16, background: 'var(--page)', textDecoration: 'none', color: 'var(--ink)' }}>
            <span>
              <strong>{inv.invoice_number}</strong>
              <span className={s.muted}> · {shortDate(inv.created_at)}</span>
            </span>
            <span className={s.row} style={{ gap: 8 }}>
              <strong>{inr(inv.total)}</strong>
              {inv.status === 'cancelled' ? (
                <StatusTag>Cancelled</StatusTag>
              ) : Number(inv.balance) > 0 ? (
                <StatusTag tone="orange">Owes {inr(inv.balance)}</StatusTag>
              ) : (
                <StatusTag tone="good">Paid</StatusTag>
              )}
            </span>
          </Link>
        ))}
        {invoices.length > 5 && (
          <Link href={`/admin/bills?q=${encodeURIComponent(customer.phone)}`} style={{ fontWeight: 700 }}>
            See all {invoices.length} bills →
          </Link>
        )}
      </div>

      {isAdmin(role) && (
        <div className={s.stack} style={{ gap: 10, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
          {removing ? (
            <>
              <p style={{ margin: 0 }}>
                Remove {customer.name} from the customer list? Their bills and eye tests are kept.
              </p>
              <div className={s.row} style={{ gap: 10 }}>
                <button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={remove}>
                  Yes, remove
                </button>
                <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => setRemoving(false)}>
                  No
                </button>
              </div>
              <ErrorNote>{removeError}</ErrorNote>
            </>
          ) : (
            <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ alignSelf: 'flex-start', minHeight: 48 }} onClick={() => setRemoving(true)}>
              Remove customer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EditCustomer({ customer, onSaved, onCancel }: { customer: Detail['customer']; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? '',
    address: customer.address ?? '',
    notes: customer.notes ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminPut(`/api/admin/customers/${encodeURIComponent(customer.id)}`, {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        email: form.email.trim(),
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      });
      onSaved();
    } catch (err: any) {
      const msg = String(err.message ?? '');
      setError(/phone/.test(msg) ? 'Enter a 10-digit mobile number.' : /email/.test(msg) ? 'Enter a proper email, or leave it empty.' : /name/.test(msg) ? 'Use letters only in the name.' : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className={s.h3} style={{ fontSize: 20 }}>
        Change {customer.name}’s details
      </h2>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
        <label className={s.field}>
          Name
          <input className={s.input} value={form.name} onChange={set('name')} required minLength={2} maxLength={255} />
        </label>
        <label className={s.field}>
          Mobile number
          <input className={s.input} type="tel" inputMode="numeric" value={form.phone} onChange={set('phone')} required />
        </label>
        <label className={s.field}>
          <span>
            Email <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
          </span>
          <input className={s.input} type="email" value={form.email} onChange={set('email')} maxLength={255} />
        </label>
        <label className={s.field}>
          <span>
            Address <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
          </span>
          <input className={s.input} value={form.address} onChange={set('address')} maxLength={1000} />
        </label>
      </div>
      <label className={s.field}>
        <span>
          Note <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
        </span>
        <textarea className={s.input} value={form.notes} onChange={set('notes')} maxLength={2000} />
      </label>
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnDark}`} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
