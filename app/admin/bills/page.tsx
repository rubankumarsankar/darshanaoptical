'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Mail, MessageCircle, Printer, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { canSeeMoney, inr, periodRange, shopDay, shortDate, waLink, type Period } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, MoneyStat, PageHead, StatusTag } from '../_ui/parts';

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
  // Totals for what's on screen; cancelled bills don't count as money.
  const activeBills = bills.filter((b) => b.status !== 'cancelled');
  const sum = (k: 'total' | 'paid' | 'balance') => activeBills.reduce((n, b) => n + Number(b[k] || 0), 0);
  const owingCount = activeBills.filter((b) => Number(b.balance) > 0).length;

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
        <Link href="/admin/sale" className={`${s.btn} ${s.btnPrimary}`}>
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

      {canCancel && data && activeBills.length > 0 && (
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
          <MoneyStat label="Bills" value={String(activeBills.length)} note={when === 'any' ? 'Shown below' : WHEN.find((w) => w.id === when)?.label} />
          <MoneyStat label="Billed" value={inr(sum('total'))} />
          <MoneyStat label="Collected" value={inr(sum('paid'))} />
          <MoneyStat label="Still to collect" value={inr(sum('balance'))} note={owingCount ? `${owingCount} bill${owingCount === 1 ? '' : 's'}` : 'All paid'} warm={sum('balance') > 0} />
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
          const owes = live && Number(b.balance) > 0;
          return (
            <div key={b.id} className={s.attention} style={{ padding: '12px 14px 12px 18px', gap: 14, opacity: live ? 1 : 0.65, borderLeft: `5px solid ${owes ? 'var(--orange)' : live ? 'var(--success)' : '#C9C7C0'}` }}>
              <Link href={`/admin/bills/${ref}`} className={s.tap} style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'var(--ink)' }} aria-label={`Open bill ${b.invoice_number}`}>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 17, letterSpacing: '.01em' }}>{b.invoice_number}</strong>
                    <StatusTag tone={st.tone}>{st.label}</StatusTag>
                  </span>
                  <span className={s.muted} style={{ display: 'block', fontSize: 15, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{b.customer_name}</strong> · {b.customer_phone} · {shortDate(b.created_at)}
                  </span>
                </span>
                <span style={{ textAlign: 'right', flex: 'none' }}>
                  <strong style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 22, textDecoration: live ? undefined : 'line-through' }}>{inr(b.total)}</strong>
                  {owes ? (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange-deep)' }}>Owes {inr(b.balance)}</span>
                  ) : (
                    live && <span className={s.muted} style={{ fontSize: 14 }}>Fully paid</span>
                  )}
                </span>
                <ChevronRight size={20} color="#8A8C95" aria-hidden style={{ flex: 'none' }} />
              </Link>
              <span className={s.row} style={{ gap: 6, flex: 'none' }}>
                {owes && (
                  <Link href={`/admin/take-payment?customer=${encodeURIComponent(b.customer_id)}`} className={`${s.btn} ${s.btnPrimary}`} style={{ minHeight: 46 }}>
                    Take payment
                  </Link>
                )}
                <Link href={`/admin/bills/${ref}?print=invoice`} className={s.iconBtn} style={{ color: 'var(--ink)' }} title="Print" aria-label={`Print bill ${b.invoice_number}`}>
                  <Printer size={19} aria-hidden />
                </Link>
                {wa && live && (
                  <a href={wa} target="_blank" rel="noreferrer" className={s.iconBtn} style={{ background: 'var(--success-soft, #E3F4EC)', color: 'var(--success)' }} title="Send on WhatsApp" aria-label={`Send bill ${b.invoice_number} on WhatsApp`}>
                    <MessageCircle size={19} aria-hidden />
                  </a>
                )}
                {live && (
                  <button type="button" className={s.iconBtn} disabled={emailing === b.id} onClick={() => email(b)} title="Email" aria-label={`Email bill ${b.invoice_number}`}>
                    {emailing === b.id ? <span style={{ fontSize: 12 }}>…</span> : <Mail size={19} aria-hidden />}
                  </button>
                )}
                {live && canCancel && (
                  <button type="button" onClick={() => setCancelling(b)} aria-label={`Cancel bill ${b.invoice_number}`} style={{ border: 0, background: 'none', font: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--danger)', padding: '0 8px', minHeight: 46, cursor: 'pointer' }}>
                    Cancel
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
