'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { daysBetween, initials, inr, shopDay, shortDate, waLink } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';

interface Order {
  id: string;
  invoice_number: string;
  customer_id: string;
  name: string;
  phone: string;
  item: string;
  status: 'new' | 'lens_ordered' | 'in_process' | 'ready' | 'delivered';
  expected_date: string | null;
  balance: number;
  told: boolean;
  since: string | null;
}

type Tab = 'lab' | 'ready' | 'done';
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'lab', label: 'At the lab', hint: 'When glasses come back from the lab, tap “Glasses arrived”.' },
  { id: 'ready', label: 'Ready for pickup', hint: 'Tell customers their glasses are ready, then hand them over.' },
  { id: 'done', label: 'Handed over', hint: 'Orders collected by customers.' },
];

/** Where an order is while it's with the lab, in plain words. */
const LAB_STEP: Partial<Record<Order['status'], string>> = { new: 'Not sent yet', lens_ordered: 'Lens ordered', in_process: 'Being made' };
const NEXT_STEP: Partial<Record<Order['status'], { to: 'lens_ordered' | 'in_process'; label: string }>> = {
  new: { to: 'lens_ordered', label: 'Lens ordered' },
  lens_ordered: { to: 'in_process', label: 'Being made' },
};

const tabOf = (o: Order): Tab => (o.status === 'ready' ? 'ready' : o.status === 'delivered' ? 'done' : 'lab');

function dueTag(o: Order, today: string): { text: string; tone: 'late' | 'good' | 'neutral' } {
  if (o.status === 'delivered') return { text: `Handed over ${shortDate(o.since)}`, tone: 'neutral' };
  if (o.status === 'ready') return { text: o.told ? 'Customer told' : 'Not told yet', tone: o.told ? 'good' : 'neutral' };
  if (!o.expected_date) return { text: 'No date set', tone: 'neutral' };
  const d = daysBetween(today, o.expected_date);
  if (d < 0) return { text: `Late ${-d} day${d === -1 ? '' : 's'}`, tone: 'late' };
  if (d === 0) return { text: 'Due today', tone: 'neutral' };
  if (d === 1) return { text: 'Due tomorrow', tone: 'neutral' };
  return { text: `Due ${shortDate(o.expected_date)}`, tone: 'neutral' };
}

const readyText = (o: Order) =>
  `Hello ${o.name}, your glasses from Darshana Optical are ready for pickup (bill ${o.invoice_number}).${o.balance > 0 ? ` Balance to pay: ${inr(o.balance)}.` : ''} We're open 9:30 AM – 9:00 PM. Thank you!`;

export default function OrdersPage() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}

function Orders() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = (['lab', 'ready', 'done'] as const).find((t) => t === params.get('tab')) ?? 'lab';
  const { data, loading, error, refetch } = useAdminFetch<{ orders: Order[] }>('/api/admin/simple/orders');
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [justArrived, setJustArrived] = useState<Order | null>(null);
  const [owing, setOwing] = useState<Order | null>(null);
  const today = shopDay();

  const orders = data?.orders ?? [];
  const list = orders.filter((o) => tabOf(o) === tab);

  const setTab = (t: Tab) => router.replace(`/admin/orders?tab=${t}`, { scroll: false });

  const move = async (o: Order, status: 'lens_ordered' | 'in_process' | 'ready' | 'delivered') => {
    setBusy(o.id);
    setActionError('');
    try {
      await adminPut(`/api/admin/invoices/${encodeURIComponent(o.id)}`, { order_status: status });
      if (status === 'ready') setJustArrived({ ...o, status: 'ready' });
      setOwing(null);
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not update the order.');
    } finally {
      setBusy(null);
    }
  };

  const markTold = async (o: Order) => {
    // Best effort: the message itself was already opened in WhatsApp.
    await adminPost('/api/admin/simple/orders', { invoice_id: o.id }).catch(() => {});
    setJustArrived(null);
    void refetch();
  };

  const handOver = (o: Order) => {
    if (o.balance > 0) setOwing(o);
    else void move(o, 'delivered');
  };

  return (
    <>
      <PageHead title="Orders" />

      <div role="tablist" aria-label="Order status" className={s.tabs} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', maxWidth: 760 }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={s.tabBtn} onClick={() => setTab(t.id)}>
            <span className={s.tabCount}>{orders.filter((o) => tabOf(o) === t.id).length}</span>
            <span className={s.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>
      <p className={s.help} style={{ fontSize: 17 }}>
        {TABS.find((t) => t.id === tab)!.hint}
      </p>

      {justArrived && (
        <div className={`${s.cardTight} ${s.up}`} role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, background: 'var(--success-soft)' }}>
          <span style={{ flex: '1 1 260px', fontSize: 17 }}>
            <strong>{justArrived.name}’s glasses are ready.</strong> Send them a message?
          </span>
          {waLink(justArrived.phone, readyText(justArrived)) && (
            <a href={waLink(justArrived.phone, readyText(justArrived))!} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} onClick={() => markTold(justArrived)}>
              Send WhatsApp
            </a>
          )}
          <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => setJustArrived(null)}>
            Not now
          </button>
        </div>
      )}

      {owing && (
        <div className={`${s.card} ${s.up}`} role="alertdialog" aria-labelledby="owing-title" style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--soft-orange)' }}>
          <h2 id="owing-title" className={s.h3} style={{ fontSize: 20 }}>
            {owing.name} still owes {inr(owing.balance)}
          </h2>
          <p style={{ margin: 0 }}>Take the payment first, then hand over the glasses.</p>
          <div className={s.row} style={{ gap: 10 }}>
            <Link href={`/admin/take-payment?customer=${encodeURIComponent(owing.customer_id)}&handover=${encodeURIComponent(owing.id)}`} className={`${s.btn} ${s.btnPrimary}`}>
              Take payment
            </Link>
            <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => move(owing, 'delivered')} disabled={busy === owing.id}>
              Hand over without paying
            </button>
            <button type="button" className={`${s.btn} ${s.btnSoft}`} onClick={() => setOwing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ErrorNote>{error || actionError}</ErrorNote>

      <div className={s.stack} style={{ gap: 12 }}>
        {loading && !data && <EmptyState>Loading orders…</EmptyState>}
        {data && list.length === 0 && <EmptyState>Nothing here right now.</EmptyState>}
        {list.map((o) => {
          const tag = dueTag(o, today);
          const tell = o.status === 'ready' && !o.told ? waLink(o.phone, readyText(o)) : null;
          return (
            <div key={o.id} className={`${s.attention} ${s.up}`} style={{ padding: '18px 20px' }}>
              <span aria-hidden style={{ width: 52, height: 52, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials(o.name)}
              </span>
              <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 19 }}>{o.name}</strong>
                <span className={s.muted} style={{ fontSize: 15 }}>
                  {o.item} · {o.phone}
                  {o.balance > 0 && o.status !== 'delivered' && ` · Owes ${inr(o.balance)}`}
                </span>
              </span>
              {LAB_STEP[o.status] && <StatusTag tone="neutral">{LAB_STEP[o.status]}</StatusTag>}
              <StatusTag tone={tag.tone}>{tag.text}</StatusTag>
              {NEXT_STEP[o.status] && (
                <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48 }} disabled={busy === o.id} onClick={() => move(o, NEXT_STEP[o.status]!.to)}>
                  {NEXT_STEP[o.status]!.label}
                </button>
              )}
              {tell && (
                <a href={tell} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnLight}`} onClick={() => markTold(o)} aria-label={`Send WhatsApp to ${o.name}`}>
                  Tell them
                </a>
              )}
              {o.status !== 'delivered' && o.status !== 'ready' && (
                <button type="button" className={`${s.btn} ${s.btnDark}`} disabled={busy === o.id} onClick={() => move(o, 'ready')}>
                  {busy === o.id ? 'Saving…' : 'Glasses arrived'}
                </button>
              )}
              {o.status === 'ready' && (
                <button type="button" className={`${s.btn} ${s.btnPrimary}`} disabled={busy === o.id} onClick={() => handOver(o)}>
                  {busy === o.id ? 'Saving…' : 'Hand over'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
