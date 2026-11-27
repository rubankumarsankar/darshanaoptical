'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, MessageCircle, Printer, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { canSeeMoney, inr, periodRange, shopDay, shortDate, waLink, type Period } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';

interface Bill {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  total: string;
  paid: string;
  balance: string;
  status: 'paid' | 'partially_paid' | 'pending' | 'cancelled';
  created_at: string;
}

const STATUS: Record<Bill['status'], { label: string; tone: 'good' | 'orange' | 'neutral' | 'late' }> = {
  paid: { label: 'Paid', tone: 'good' },
  partially_paid: { label: 'Part paid', tone: 'orange' },
  pending: { label: 'Not paid', tone: 'late' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

type Show = 'all' | 'owing' | 'paid' | 'cancelled';
const SHOW: { id: Show; label: string }[] = [
  { id: 'all', label: 'All bills' },
  { id: 'owing', label: 'Still to pay' },
  { id: 'paid', label: 'Paid' },
  { id: 'cancelled', label: 'Cancelled' },
];
type When = 'any' | Period;
const WHEN: { id: When; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

const billText = (b: Bill) =>
  [
    `Hello ${b.customer_name}, here is your bill from Darshana Optical.`,
    `Bill ${b.invoice_number} · ${shortDate(b.created_at)}`,
    `Total: ${inr(b.total)}`,
    `Paid: ${inr(b.paid)}`,
    Number(b.balance) > 0 ? `Balance to pay: ${inr(b.balance)}` : 'Fully paid. Thank you!',
  ].join('\n');

export default function BillsPage() {
  return (
    <Suspense>
      <Bills />
    </Suspense>
  );
}

function Bills() {
  const params = useSearchParams();
  const { role } = useAuth();
  const canCancel = canSeeMoney(role); // the invoice route allows cancelling for admin and manager only
  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [debounced, setDebounced] = useState(q);
  const [show, setShow] = useState<Show>('all');
  const [when, setWhen] = useState<When>('any');
  const [emailing, setEmailing] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [cancelling, setCancelling] = useState<Bill | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const range = when === 'any' ? null : periodRange(when, shopDay());
  const { data, loading, error, refetch } = useAdminFetch<{ invoices: Bill[] }>('/api/admin/invoices', {
    params: { q: debounced, ...(range ? { from: range.from, to: range.to } : {}) },
  });
  const bills = (data?.invoices ?? [])
    .filter((b) =>
      show === 'all' ? true : show === 'owing' ? b.status !== 'cancelled' && Number(b.balance) > 0 : show === 'paid' ? b.status === 'paid' : b.status === 'cancelled',
    )
    .slice(0, 80);

  const email = async (b: Bill) => {
    setEmailing(b.id);
    setNote(null);
    try {
      const res = await adminPost<{ message?: string }>(`/api/admin/invoices/${encodeURIComponent(b.invoice_number.toLowerCase())}/email`, {});
      setNote({ ok: true, text: res.message ?? `Bill ${b.invoice_number} emailed.` });
    } catch (err: any) {
      setNote({ ok: false, text: err.message ?? 'The bill could not be emailed.' });
    } finally {
      setEmailing(null);
    }
  };

  const cancel = async (b: Bill) => {
    setBusy(true);
    setNote(null);
    try {
      // Server side: locks the bill, writes refund rows for money taken, puts
      // stock back and records it in the audit log, all in one transaction.
      await adminPut(`/api/admin/invoices/${encodeURIComponent(b.id)}`, { cancel: true });
      setNote({ ok: true, text: `Bill ${b.invoice_number} cancelled.${Number(b.paid) > 0 ? ` ${inr(b.paid)} marked as refunded.` : ''} Items are back in stock.` });
      setCancelling(null);
      await refetch();
    } catch (err: any) {
      setNote({ ok: false, text: err.message ?? 'The bill could not be cancelled.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="Bills" sub="Every bill, by number, name or phone.">
        <Link href="/admin/simple/sale" className={`${s.btn} ${s.btnPrimary}`}>
          + New sale
        </Link>
      </PageHead>

      <label className={s.search}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Bill number, name or phone</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bill number, name or phone" />
      </label>

      <div className={s.row} style={{ gap: 18 }}>
        <div role="tablist" aria-label="Which bills" className={s.row} style={{ gap: 8 }}>
          {SHOW.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={show === x.id} className={s.chip} onClick={() => setShow(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="When" className={s.row} style={{ gap: 8 }}>
          {WHEN.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={when === x.id} className={s.chip} onClick={() => setWhen(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {cancelling && (
        <div className={`${s.card} ${s.up}`} role="alertdialog" aria-labelledby="cancel-bill-title" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--soft-orange)' }}>
          <h2 id="cancel-bill-title" className={s.h3} style={{ fontSize: 20 }}>
            Cancel bill {cancelling.invoice_number} for {cancelling.customer_name}?
          </h2>
          <p style={{ margin: 0 }}>
            {Number(cancelling.paid) > 0 ? `The ${inr(cancelling.paid)} they paid will be recorded as refunded — give the money back. ` : ''}
            The items go back into stock. This can’t be undone.
          </p>
          <div className={s.row} style={{ gap: 10 }}>
            <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={busy} onClick={() => cancel(cancelling)}>
              {busy ? 'Cancelling…' : 'Yes, cancel the bill'}
            </button>
            <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => setCancelling(null)}>
              No, keep it
            </button>
          </div>
        </div>
      )}

      <ErrorNote>{error}</ErrorNote>
      {note && (
        <p role="status" className={note.ok ? undefined : s.error} style={note.ok ? { margin: 0, color: 'var(--success-text)', fontWeight: 700 } : undefined}>
          {note.text}
        </p>
      )}

      <div className={s.stack} style={{ gap: 10 }}>
        {loading && !data && <EmptyState>Loading bills…</EmptyState>}
        {data && bills.length === 0 && <EmptyState>{debounced ? `No bills found for “${debounced}”.` : 'No bills here.'}</EmptyState>}
        {bills.map((b) => {
          const st = STATUS[b.status] ?? STATUS.pending;
          const wa = waLink(b.customer_phone, billText(b));
          const ref = encodeURIComponent(b.invoice_number.toLowerCase());
          const live = b.status !== 'cancelled';
          return (
            <div key={b.id} className={s.attention} style={{ padding: '14px 18px' }}>
              <Link href={`/admin/invoices/${ref}`} style={{ flex: '1 1 240px', minWidth: 0, textDecoration: 'none', color: 'var(--ink)' }}>
                <strong style={{ display: 'block', fontSize: 18 }}>{b.invoice_number}</strong>
                <span className={s.muted} style={{ fontSize: 15 }}>
                  {b.customer_name} · {b.customer_phone} · {shortDate(b.created_at)}
                </span>
              </Link>
              <span style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 22 }}>{inr(b.total)}</strong>
                {live && Number(b.balance) > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange-deep)' }}>Owes {inr(b.balance)}</span>
                )}
              </span>
              <StatusTag tone={st.tone}>{st.label}</StatusTag>
              <span className={s.row} style={{ gap: 8 }}>
                {live && Number(b.balance) > 0 && (
                  <Link href={`/admin/simple/take-payment?customer=${encodeURIComponent(b.customer_id)}`} className={`${s.btn} ${s.btnPrimary}`} style={{ minHeight: 48 }}>
                    Take payment
                  </Link>
                )}
                <Link href={`/admin/invoices/${ref}?print=invoice`} className={`${s.btn} ${s.btnDark}`} style={{ minHeight: 48 }} aria-label={`Print bill ${b.invoice_number}`}>
                  <Printer size={18} aria-hidden /> Print
                </Link>
                {wa && live && (
                  <a href={wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} style={{ minHeight: 48 }} aria-label={`Send bill ${b.invoice_number} on WhatsApp`}>
                    <MessageCircle size={18} aria-hidden /> WhatsApp
                  </a>
                )}
                {live && (
                  <button type="button" className={`${s.btn} ${s.btnLight}`} style={{ minHeight: 48 }} disabled={emailing === b.id} onClick={() => email(b)} aria-label={`Email bill ${b.invoice_number}`}>
                    <Mail size={18} aria-hidden /> {emailing === b.id ? 'Sending…' : 'Email'}
                  </button>
                )}
                {live && canCancel && (
                  <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48 }} onClick={() => setCancelling(b)} aria-label={`Cancel bill ${b.invoice_number}`}>
                    Cancel bill
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
