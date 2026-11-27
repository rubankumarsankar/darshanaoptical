'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { canManageStock, inr, waLink } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';
import ItemForm from '../_ui/ItemForm';

interface Item {
  id: string;
  product_code: string;
  name: string;
  brand: string;
  category: 'frame' | 'lens' | 'sunglass' | 'accessory' | 'service';
  selling_price: string;
  purchase_price: string;
  stock: number;
  low_stock_threshold: number;
  status: 'active' | 'inactive';
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  status: string;
}

type Reason = 'damaged' | 'returned' | 'counted';
const CATEGORY: Record<Item['category'], string> = { frame: 'Frame', lens: 'Lens', sunglass: 'Sunglasses', accessory: 'Accessory', service: 'Service' };
const REASON_WORDS: Record<Reason, string> = { damaged: 'Damaged or broken', returned: 'Customer returned it', counted: 'Counted the shelf' };

const isLow = (i: Item) => i.category !== 'service' && i.stock <= i.low_stock_threshold;

export default function StockPage() {
  const { role } = useAuth();
  const manage = canManageStock(role);
  const { data, loading, error, refetch } = useAdminFetch<{ products: Item[] }>('/api/admin/inventory');
  const { data: supplierData } = useAdminFetch<{ suppliers: Supplier[] }>(manage ? '/api/admin/suppliers' : null);
  const [tab, setTab] = useState<'low' | 'all'>('low');
  const [q, setQ] = useState('');
  const [asking, setAsking] = useState<{ item: Item; change: 1 | -1 } | null>(null);
  const [reasons, setReasons] = useState<Record<string, Reason>>({});
  const [ordering, setOrdering] = useState<Item | null>(null);
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const items = useMemo(() => data?.products ?? [], [data]);
  const low = items.filter(isLow);
  const needle = q.trim().toLowerCase();
  const shown = (tab === 'low' ? low : items).filter((i) => !needle || `${i.name} ${i.brand} ${i.product_code}`.toLowerCase().includes(needle));

  const apply = async (item: Item, change: 1 | -1, reason: Reason) => {
    setBusy(item.id);
    setActionError('');
    try {
      await adminPost('/api/admin/simple/stock', { product_id: item.id, change, reason });
      setReasons((r) => ({ ...r, [item.id]: reason }));
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not change the count.');
    } finally {
      setBusy(null);
    }
  };

  /** First tap on a row asks why; later taps the same way reuse the answer. */
  const tap = (item: Item, change: 1 | -1) => {
    const known = reasons[item.id];
    const fits = known && (known === 'counted' || (known === 'damaged' ? change < 0 : change > 0));
    if (fits) void apply(item, change, known);
    else setAsking({ item, change });
  };

  const suggested = (i: Item) => Math.max(1, i.low_stock_threshold * 2 - i.stock);

  return (
    <>
      <PageHead title="Stock">
        {manage && (
          <span className={s.row} style={{ gap: 10 }}>
            <button type="button" className={`${s.btn} ${s.btnDark}`} onClick={() => setEditing('new')}>
              + New item
            </button>
            <Link href="/admin/simple/new-stock" className={`${s.btn} ${s.btnPrimary}`}>
              + New stock arrived
            </Link>
          </span>
        )}
      </PageHead>

      <div role="tablist" aria-label="Show" className={s.tabs} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', maxWidth: 520 }}>
        <button type="button" role="tab" aria-selected={tab === 'low'} className={s.tabBtn} onClick={() => setTab('low')}>
          <span className={s.tabCount}>{low.length}</span>
          <span className={s.tabLabel}>Running low</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'all'} className={s.tabBtn} onClick={() => setTab('all')}>
          <span className={s.tabCount}>{items.length}</span>
          <span className={s.tabLabel}>All items</span>
        </button>
      </div>

      <label className={s.search}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Find an item</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an item by name, brand or code" />
      </label>

      {editing && (
        <ItemForm
          item={editing === 'new' ? undefined : editing}
          initialName={editing === 'new' ? q.trim() : undefined}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refetch();
          }}
        />
      )}

      {asking && (
        <div className={`${s.card} ${s.up}`} role="dialog" aria-labelledby="why-title" style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--soft-orange)' }}>
          <h2 id="why-title" className={s.h3} style={{ fontSize: 20 }}>
            Why is {asking.item.name} going {asking.change > 0 ? 'up' : 'down'}?
          </h2>
          <div className={s.row} style={{ gap: 10 }}>
            {(asking.change < 0 ? (['damaged', 'counted'] as const) : (['returned', 'counted'] as const)).map((r) => (
              <button
                key={r}
                type="button"
                className={`${s.btn} ${s.btnLight}`}
                onClick={() => {
                  const a = asking;
                  setAsking(null);
                  void apply(a.item, a.change, r);
                }}
              >
                {REASON_WORDS[r]}
              </button>
            ))}
            <button type="button" className={`${s.btn} ${s.btnSoft}`} onClick={() => setAsking(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {ordering && (
        <div className={`${s.card} ${s.up}`} role="dialog" aria-labelledby="order-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 id="order-title" className={s.h3} style={{ fontSize: 20 }}>
            Order {suggested(ordering)} more {ordering.name}
          </h2>
          <p className={s.help}>Pick a supplier to send them a WhatsApp message.</p>
          <div className={s.row} style={{ gap: 10 }}>
            {(supplierData?.suppliers ?? [])
              .filter((sp) => sp.status !== 'inactive')
              .map((sp) => {
                const href = waLink(sp.phone, `Hello ${sp.name}, please send ${suggested(ordering)} × ${ordering.name} (${ordering.brand}, code ${ordering.product_code}). — Darshana Optical`);
                return href ? (
                  <a key={sp.id} href={href} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} onClick={() => setOrdering(null)}>
                    {sp.name}
                  </a>
                ) : null;
              })}
            {(supplierData?.suppliers ?? []).length === 0 && <span className={s.help}>No suppliers yet. Add one under “New stock arrived”.</span>}
            <button type="button" className={`${s.btn} ${s.btnSoft}`} onClick={() => setOrdering(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ErrorNote>{error || actionError}</ErrorNote>

      <div className={s.stack} style={{ gap: 10 }}>
        {loading && !data && <EmptyState>Loading stock…</EmptyState>}
        {data && shown.length === 0 && <EmptyState>{tab === 'low' && !needle ? 'Nothing is running low.' : 'Nothing matches.'}</EmptyState>}
        {shown.map((i) => (
          <div key={i.id} className={`${s.attention}`} style={{ padding: '14px 18px' }}>
            <span style={{ flex: '1 1 220px', minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 18 }}>{i.name}</strong>
              <span className={s.muted} style={{ fontSize: 15 }}>
                {CATEGORY[i.category]} · {i.brand} · {inr(i.selling_price)}
              </span>
            </span>
            {isLow(i) && <StatusTag tone={i.stock === 0 ? 'late' : 'orange'}>{i.stock === 0 ? 'Out of stock' : 'Running low'}</StatusTag>}
            {i.category !== 'service' && (
            <span className={s.row} style={{ gap: 8, flexWrap: 'nowrap' }}>
              {manage && (
                <button type="button" className={s.stepperBtn} style={{ background: 'var(--page)' }} aria-label={`One less ${i.name}`} disabled={i.stock <= 0 || busy === i.id} onClick={() => tap(i, -1)}>
                  −
                </button>
              )}
              <span aria-label={`${i.stock} in stock`} style={{ minWidth: 64, textAlign: 'center', fontFamily: 'var(--display)', fontSize: 30, fontWeight: 700 }}>
                {i.stock}
              </span>
              {manage && (
                <button type="button" className={s.stepperBtn} style={{ background: 'var(--page)' }} aria-label={`One more ${i.name}`} disabled={busy === i.id} onClick={() => tap(i, 1)}>
                  +
                </button>
              )}
            </span>
            )}
            {manage && (
              <button type="button" className={`${s.btn} ${s.btnLight}`} aria-label={`Change ${i.name}`} onClick={() => setEditing(i)}>
                Change
              </button>
            )}
            {manage && isLow(i) && (
              <button type="button" className={`${s.btn} ${s.btnDark}`} onClick={() => setOrdering(i)}>
                Order more
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
