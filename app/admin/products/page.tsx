'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Eye, Glasses, Package, Search, Sun, Wrench, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { canManageStock, inr } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';
import ItemForm, { type ItemCategory, type ItemValues } from '../_ui/ItemForm';
import { brandKey } from '@/app/lib/admin/brands';

const LIMIT = 120;

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
// Shown when a product has no photo, so each category is still easy to spot.
const CATEGORY_ICON: Record<ItemCategory, LucideIcon> = { frame: Glasses, lens: Eye, sunglass: Sun, accessory: Package, service: Wrench };

export default function ProductsPage() {
  const { role } = useAuth();
  const manage = canManageStock(role);
  // status=all so switched-off items can be found and switched back on.
  const { data, loading, error, refetch } = useAdminFetch<{ products: Product[] }>('/api/admin/products', { params: { status: 'all' } });
  const [shelf, setShelf] = useState<Shelf>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const products = useMemo(() => data?.products ?? [], [data]);
  // Each brand once (ignoring case and stray spaces), with how many items it has.
  const brands = useMemo(() => {
    const m = new Map<string, { name: string; n: number }>();
    for (const p of products) {
      const name = p.brand?.trim();
      if (!name) continue;
      const e = m.get(brandKey(name));
      if (e) e.n++;
      else m.set(brandKey(name), { name, n: 1 });
    }
    return [...m.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [products]);
  const count = (sh: Shelf) => products.filter((p) => (sh === 'off' ? p.status === 'inactive' : p.status === 'active' && (sh === 'all' || p.category === sh))).length;
  const needle = q.trim().toLowerCase();
  const matching = products
    .filter((p) => (shelf === 'off' ? p.status === 'inactive' : p.status === 'active' && (shelf === 'all' || p.category === shelf)))
    .filter((p) => !brand || brandKey(p.brand ?? '') === brand)
    .filter((p) => !needle || [p.name, p.brand, p.product_code, p.model, p.color, p.size, p.material].filter(Boolean).join(' ').toLowerCase().includes(needle));
  const shown = matching.slice(0, LIMIT);

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
          knownBrands={brands.map(([, b]) => b.name)}
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

      <div className={s.row} style={{ gap: 10, alignItems: 'stretch' }}>
        <label className={s.search} style={{ flex: '1 1 320px' }}>
          <Search size={22} color="#5E606A" aria-hidden />
          <span className={s.srOnly}>Find a product</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, brand, code, model or colour" />
        </label>
        <label style={{ flex: '0 1 240px', display: 'flex' }}>
          <span className={s.srOnly}>Brand</span>
          <select className={s.input} value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%' }}>
            <option value="">All brands</option>
            {brands.map(([key, b]) => (
              <option key={key} value={key}>
                {b.name} ({b.n})
              </option>
            ))}
          </select>
        </label>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
        {loading && !data && <EmptyState>Loading products…</EmptyState>}
        {data && shown.length === 0 && <EmptyState>{needle || brand ? 'Nothing matches. Try another search or brand.' : 'Nothing here yet.'}</EmptyState>}
        {shown.map((p, i) => {
          const low = p.category !== 'service' && p.stock <= p.low_stock_threshold;
          const body = (
            <>
              <span style={{ position: 'relative', height: 140, borderRadius: 18, background: 'var(--page)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <Image src={p.image_url} alt="" fill sizes="240px" loading={i < 4 ? 'eager' : 'lazy'} style={{ objectFit: 'cover' }} unoptimized={/^https?:/.test(p.image_url)} />
                ) : (
                  (() => { const Icon = CATEGORY_ICON[p.category] ?? Glasses; return <Icon size={48} color="#B8B9BF" aria-hidden />; })()
                )}
                <span style={{ position: 'absolute', left: 10, top: 10 }}>
                  <StatusTag>{CATEGORY[p.category]}</StatusTag>
                </span>
                {/* Stock sits on the photo so it never wraps under the price. */}
                {p.category !== 'service' && (
                  <span style={{ position: 'absolute', right: 10, bottom: 10 }}>
                    {low ? <StatusTag tone={p.stock === 0 ? 'late' : 'orange'}>{p.stock === 0 ? 'None left' : `Only ${p.stock} left`}</StatusTag> : <StatusTag tone="good">{p.stock} in stock</StatusTag>}
                  </span>
                )}
              </span>
              <span style={{ display: 'block' }}>
                <strong style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 17, lineHeight: 1.3 }} title={p.name}>
                  {p.name}
                </strong>
                <span className={s.muted} style={{ display: 'block', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[p.brand, p.category === 'service' ? null : p.model, p.color].filter(Boolean).join(' · ')}
                </span>
              </span>
              {/* Price and code stay at the bottom, so every card lines up. */}
              <span style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 6px' }}>
                <strong style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{inr(p.selling_price)}</strong>
                {Number(p.mrp) > Number(p.selling_price) && (
                  <span className={s.muted} style={{ fontSize: 14, textDecoration: 'line-through' }}>
                    {inr(p.mrp)}
                  </span>
                )}
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
      {matching.length > LIMIT && (
        <p className={s.muted} style={{ margin: 0, textAlign: 'center' }}>
          Showing {LIMIT} of {matching.length}. Search or pick a brand to find the rest.
        </p>
      )}
    </>
  );
}
