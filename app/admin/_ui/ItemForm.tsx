'use client';

import { useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import s from './simple.module.css';
import { ErrorNote } from './parts';
import { brandSuggestions, matchBrand } from '@/app/lib/admin/brands';

export type ItemCategory = 'frame' | 'lens' | 'sunglass' | 'accessory' | 'service';

export interface ItemValues {
  id?: string;
  product_code?: string;
  name: string;
  brand: string;
  model?: string | null;
  category: ItemCategory;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  selling_price: string | number;
  purchase_price: string | number;
  mrp?: string | number | null;
  low_stock_threshold: number;
  /** Current count, when editing. */
  stock?: number;
  image_url?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}

const CATEGORIES: { id: ItemCategory; label: string }[] = [
  { id: 'frame', label: 'Frame' },
  { id: 'lens', label: 'Lens' },
  { id: 'sunglass', label: 'Sunglasses' },
  { id: 'accessory', label: 'Accessory' },
  { id: 'service', label: 'Service' },
];

interface ItemFormProps {
  /** Omit to create a new item. */
  item?: ItemValues;
  /** Prefill for a new item, e.g. what was typed in a search box. */
  initialName?: string;
  /** Hide "how many are in the shop now" (e.g. when a delivery will add the stock). */
  noOpeningStock?: boolean;
  /** Brands already used in the shop, for suggestions and consistent spelling. */
  knownBrands?: readonly string[];
  onSaved: (saved: { id: string; name: string; product_code: string; purchase_price: string | number; category: ItemCategory }) => void;
  onCancel: () => void;
}

const num = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '' : String(Number(v)));

/**
 * Add or edit a product. Saves through the existing products API, which is
 * management-only, gives new items a code when none is typed, and writes the
 * audit log. Photos go through the existing image upload.
 */
export default function ItemForm({ item, initialName = '', noOpeningStock, knownBrands = [], onSaved, onCancel }: ItemFormProps) {
  const editing = !!item?.id;
  const [v, setV] = useState({
    product_code: item?.product_code ?? '',
    name: item?.name ?? initialName,
    brand: item?.brand ?? '',
    model: item?.model ?? '',
    color: item?.color ?? '',
    size: item?.size ?? '',
    material: item?.material ?? '',
    selling_price: num(item?.selling_price),
    purchase_price: num(item?.purchase_price),
    mrp: num(item?.mrp),
    low_stock_threshold: String(item?.low_stock_threshold ?? 5),
    description: item?.description ?? '',
    image_url: item?.image_url ?? '',
  });
  const [category, setCategory] = useState<ItemCategory>(item?.category ?? 'frame');
  const [opening, setOpening] = useState('0');
  // Editing: the count can be corrected here; the difference is saved as a stock adjustment.
  const startStock = Math.max(0, Number(item?.stock ?? 0));
  const [stockCount, setStockCount] = useState(String(startStock));
  const stockChanged = stockCount !== '' && Math.round(Number(stockCount)) !== startStock;
  const [active, setActive] = useState(item?.status !== 'inactive');
  const [more, setMore] = useState(editing && !!(item?.model || item?.color || item?.size || item?.material || item?.description));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'The photo could not be uploaded.');
      setV((prev) => ({ ...prev, image_url: json.url }));
    } catch (err: any) {
      setError(err.message ?? 'The photo could not be uploaded.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const selling = Number(v.selling_price) || 0;
    if (v.mrp !== '' && Number(v.mrp) < selling) {
      setError('The selling price is more than the MRP. Check both prices.');
      return;
    }
    setBusy(true);
    const body = {
      name: v.name.trim().replace(/\s+/g, ' '),
      brand: matchBrand(v.brand, knownBrands),
      category,
      model: v.model.trim() || null,
      color: v.color.trim() || null,
      size: v.size.trim() || null,
      material: v.material.trim() || null,
      selling_price: selling,
      purchase_price: Number(v.purchase_price) || 0,
      // Empty MRP: a new item takes the selling price; an edit clears the old MRP.
      ...(v.mrp !== '' ? { mrp: Number(v.mrp) || 0 } : editing ? { mrp: null } : {}),
      low_stock_threshold: Math.max(0, Math.round(Number(v.low_stock_threshold) || 0)),
      image_url: v.image_url.trim() || null,
      description: v.description.trim() || null,
    };
    try {
      if (editing) {
        const adjust = category !== 'service' && !noOpeningStock && stockChanged ? Math.max(0, Math.round(Number(stockCount))) - startStock : 0;
        const res = await adminPut<{ product: any }>(`/api/admin/products/${encodeURIComponent(item!.id!)}`, {
          ...body,
          status: active ? 'active' : 'inactive',
          ...(adjust !== 0 ? { stock_adjustment: adjust, adjustment_reason: `Count corrected in Products (${startStock} → ${startStock + adjust})` } : {}),
        });
        onSaved(res.product ?? { ...body, id: item!.id!, product_code: item!.product_code ?? '' });
      } else {
        const res = await adminPost<{ product: any }>('/api/admin/products', {
          ...body,
          product_code: v.product_code.trim() || undefined,
          stock: noOpeningStock ? 0 : Math.max(0, Math.round(Number(opening) || 0)),
        });
        onSaved(res.product);
      }
    } catch (err: any) {
      const msg = String(err.message ?? '');
      setError(/Duplicate entry/i.test(msg) ? 'That product code is already used. Leave it empty to get one automatically.' : msg || 'The item could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const optional = <span className={s.muted} style={{ fontWeight: 500, fontSize: 14 }}>(optional)</span>;

  return (
    <form onSubmit={submit} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className={s.h3} style={{ fontSize: 20 }}>
        {editing ? `Change ${item!.name}` : 'New item'}
        {editing && item?.product_code && (
          <span className={s.muted} style={{ fontWeight: 500, fontSize: 15 }}>
            {' '}
            · {item.product_code}
          </span>
        )}
      </h2>

      <div role="radiogroup" aria-label="Kind of item" className={s.row} style={{ gap: 8 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={category === c.id} className={s.chip} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className={s.row} style={{ gap: 16, alignItems: 'flex-start' }}>
        {/* Photo */}
        <div className={s.stack} style={{ gap: 8, width: 150, flex: 'none' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Photo {optional}</span>
          <div style={{ position: 'relative', width: 150, height: 150, borderRadius: 22, background: 'var(--page)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {v.image_url ? (
              <Image src={v.image_url} alt="" fill sizes="150px" style={{ objectFit: 'cover' }} unoptimized={/^https?:/.test(v.image_url)} />
            ) : (
              <ImagePlus size={36} color="#8A8C95" aria-hidden />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <div className={s.row} style={{ gap: 6 }}>
            <button type="button" className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 44, padding: '0 14px', fontSize: 15 }} disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : v.image_url ? 'Change' : 'Add photo'}
            </button>
            {v.image_url && (
              <button type="button" className={s.iconBtn} style={{ width: 44, height: 44 }} aria-label="Remove photo" onClick={() => setV({ ...v, image_url: '' })}>
                <X size={18} aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className={s.grid} style={{ flex: '1 1 320px', gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))', alignItems: 'end' }}>
          <label className={s.field} style={{ gridColumn: '1 / -1' }}>
            Name
            <input className={s.input} value={v.name} onChange={set('name')} required maxLength={255} placeholder="e.g. Rectangle frame, black" />
          </label>
          <label className={s.field}>
            Brand
            <input className={s.input} value={v.brand} onChange={set('brand')} required maxLength={255} placeholder="Pick or type a brand" list="item-brands" autoComplete="off" />
            <datalist id="item-brands">
              {brandSuggestions(knownBrands, category).map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
          <label className={s.field}>
            Selling price ₹
            <input className={s.input} type="number" inputMode="decimal" min={0} step="0.01" value={v.selling_price} onChange={set('selling_price')} required />
          </label>
          <label className={s.field}>
            <span>MRP ₹ {optional}</span>
            <input className={s.input} type="number" inputMode="decimal" min={0} step="0.01" value={v.mrp} onChange={set('mrp')} />
          </label>
          <label className={s.field}>
            <span>Cost price ₹ {optional}</span>
            <input className={s.input} type="number" inputMode="decimal" min={0} step="0.01" value={v.purchase_price} onChange={set('purchase_price')} />
          </label>
          {category !== 'service' && !noOpeningStock && (
            <label className={s.field}>
              <span>
                In the shop now
                {editing && stockChanged && (
                  <span className={s.muted} style={{ fontWeight: 500, fontSize: 14 }}>
                    {' '}
                    (was {startStock})
                  </span>
                )}
              </span>
              <input
                className={s.input}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={editing ? stockCount : opening}
                onChange={(e) => (editing ? setStockCount(e.target.value) : setOpening(e.target.value))}
              />
            </label>
          )}
          {category !== 'service' && (
            <label className={s.field} title="We warn you when stock falls to this number">
              Low stock alert at
              <input className={s.input} type="number" inputMode="numeric" min={0} step={1} value={v.low_stock_threshold} onChange={set('low_stock_threshold')} />
            </label>
          )}
          {!editing && (
            <label className={s.field}>
              <span>Product code {optional}</span>
              <input className={s.input} value={v.product_code} onChange={set('product_code')} maxLength={50} placeholder="Made for you if empty, e.g. FR-0012" />
            </label>
          )}
        </div>
      </div>

      {more ? (
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
          <label className={s.field}>
            <span>Model number {optional}</span>
            <input className={s.input} value={v.model} onChange={set('model')} maxLength={255} placeholder="e.g. RB2140" />
          </label>
          <label className={s.field}>
            <span>Colour {optional}</span>
            <input className={s.input} value={v.color} onChange={set('color')} maxLength={100} placeholder="e.g. Matte black" />
          </label>
          <label className={s.field}>
            <span>Size {optional}</span>
            <input className={s.input} value={v.size} onChange={set('size')} maxLength={100} placeholder="e.g. 52-18-140" />
          </label>
          <label className={s.field}>
            <span>Material {optional}</span>
            <input className={s.input} value={v.material} onChange={set('material')} maxLength={100} placeholder="e.g. Acetate" />
          </label>
          <label className={s.field} style={{ gridColumn: '1 / -1' }}>
            <span>Description {optional}</span>
            <textarea className={s.input} value={v.description} onChange={set('description')} maxLength={2000} />
          </label>
        </div>
      ) : (
        <button type="button" className={`${s.btn} ${s.btnDashed}`} style={{ alignSelf: 'flex-start', minHeight: 48 }} onClick={() => setMore(true)}>
          + Model, colour, size, material, description
        </button>
      )}

      {editing && (
        <label className={s.row} style={{ gap: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={!active} onChange={(e) => setActive(!e.target.checked)} style={{ width: 24, height: 24 }} />
          We don’t sell this any more (hide it from sales)
        </label>
      )}
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnDark}`} disabled={busy || uploading}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
