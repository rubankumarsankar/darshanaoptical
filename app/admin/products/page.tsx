'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Glasses, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { canManageStock, inr } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';
import ItemForm, { type ItemCategory, type ItemValues } from '../_ui/ItemForm';

interface Product extends ItemValues {
  id: string;
  product_code: string;
  stock: number;
  status: 'active' | 'inactive';
}

type Shelf = 'all' | ItemCategory | 'off';
const SHELVES: { id: Shelf; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'frame', label: 'Frames' },
  { id: 'lens', label: 'Lenses' },
  { id: 'sunglass', label: 'Sunglasses' },
  { id: 'accessory', label: 'Accessories' },
  { id: 'service', label: 'Services' },
  { id: 'off', label: 'Switched off' },
];
const CATEGORY: Record<ItemCategory, string> = { frame: 'Frame', lens: 'Lens', sunglass: 'Sunglasses', accessory: 'Accessory', service: 'Service' };

export default function ProductsPage() {
  const { role } = useAuth();
  const manage = canManageStock(role);
  // status=all so switched-off items can be found and switched back on.
  const { data, loading, error, refetch } = useAdminFetch<{ products: Product[] }>('/api/admin/products', { params: { status: 'all' } });
  const [shelf, setShelf] = useState<Shelf>('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const products = useMemo(() => data?.products ?? [], [data]);
  const count = (sh: Shelf) => products.filter((p) => (sh === 'off' ? p.status === 'inactive' : p.status === 'active' && (sh === 'all' || p.category === sh))).length;
  const needle = q.trim().toLowerCase();
  const shown = products
    .filter((p) => (shelf === 'off' ? p.status === 'inactive' : p.status === 'active' && (shelf === 'all' || p.category === shelf)))
    .filter((p) => !needle || [p.name, p.brand, p.product_code, p.model, p.color].filter(Boolean).join(' ').toLowerCase().includes(needle))
    .slice(0, 120);

  return (
    <>
      <PageHead title="Products" sub={manage ? 'Everything you sell. Tap an item to change it.' : 'Everything you sell, with prices and stock.'}>
        {manage && !editing && (
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setEditing('new')}>
            + New item
          </button>
        )}
      </PageHead>

      {editing && (
        <ItemForm
          key={editing === 'new' ? 'new' : editing.id}
          item={editing === 'new' ? undefined : editing}
          initialName={editing === 'new' ? q.trim() : undefined}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refetch();
          }}
        />
      )}

      <div role="tablist" aria-label="Show" className={s.row} style={{ gap: 8 }}>
        {SHELVES.map((sh) => (
          <button key={sh.id} type="button" role="tab" aria-selected={shelf === sh.id} className={s.chip} onClick={() => setShelf(sh.id)}>
            {sh.label} <span style={{ opacity: 0.7, fontWeight: 600 }}>{count(sh.id)}</span>
          </button>
        ))}
      </div>

      <label className={s.search}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Find a product</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, brand, code, model or colour" />
      </label>

      <ErrorNote>{error}</ErrorNote>

      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {loading && !data && <EmptyState>Loading products…</EmptyState>}
        {data && shown.length === 0 && <EmptyState>{needle ? `Nothing matches “${q.trim()}”.` : 'Nothing here yet.'}</EmptyState>}
        {shown.map((p, i) => {
          const low = p.category !== 'service' && p.stock <= p.low_stock_threshold;
          const body = (
            <>
              <span style={{ position: 'relative', height: 140, borderRadius: 18, background: 'var(--page)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <Image src={p.image_url} alt="" fill sizes="240px" loading={i < 4 ? 'eager' : 'lazy'} style={{ objectFit: 'cover' }} unoptimized={/^https?:/.test(p.image_url)} />
                ) : (
                  <Glasses size={48} color="#B8B9BF" aria-hidden />
                )}
                <span style={{ position: 'absolute', left: 10, top: 10 }}>
                  <StatusTag>{CATEGORY[p.category]}</StatusTag>
                </span>
              </span>
              <span style={{ display: 'block' }}>
                <strong style={{ display: 'block', fontSize: 17, lineHeight: 1.3 }}>{p.name}</strong>
                <span className={s.muted} style={{ fontSize: 14 }}>
                  {[p.brand, p.model, p.color].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className={s.row} style={{ justifyContent: 'space-between', gap: 8 }}>
                <span>
                  <strong style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{inr(p.selling_price)}</strong>
                  {Number(p.mrp) > Number(p.selling_price) && (
                    <span className={s.muted} style={{ fontSize: 14, textDecoration: 'line-through', marginLeft: 6 }}>
                      {inr(p.mrp)}
                    </span>
                  )}
                </span>
                {p.category !== 'service' && (low ? <StatusTag tone={p.stock === 0 ? 'late' : 'orange'}>{p.stock === 0 ? 'None left' : `${p.stock} left`}</StatusTag> : <StatusTag tone="good">{p.stock} in stock</StatusTag>)}
              </span>
              <span className={s.muted} style={{ fontSize: 13 }}>
                Code {p.product_code}
              </span>
            </>
          );
          const card = { padding: 14, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', opacity: p.status === 'inactive' ? 0.6 : 1 } as const;
          return manage ? (
            <button key={p.id} type="button" className={`${s.card} ${s.tap}`} style={{ ...card, border: 0, font: 'inherit', color: 'var(--ink)', cursor: 'pointer' }} onClick={() => {
                setEditing(p);
                // The form opens above the grid.
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} aria-label={`Change ${p.name}`}>
              {body}
            </button>
          ) : (
            <div key={p.id} className={s.card} style={card}>
              {body}
            </div>
          );
        })}
      </div>
    </>
  );
}
