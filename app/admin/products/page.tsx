'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Product, ProductCategory } from '@/app/lib/admin/types';
import { can } from '@/app/lib/admin/permissions';
import { Search, Plus, Edit2, Save, X } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

const CAT_LABELS: Record<ProductCategory, string> = { frame: 'Frame', lens: 'Lens', sunglass: 'Sunglass', accessory: 'Accessory', service: 'Service' };

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<ProductCategory | 'all'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({ category: 'frame', status: 'active', stock: 0, lowStockThreshold: 3 });

  const load = () => setProducts(getStore().products.slice().reverse());
  useEffect(load, []);

  const filtered = products.filter((p) => {
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const q = query.toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q));
  });

  const canEdit = user && can(user.role, 'editProduct');
  const canAdd = user && can(user.role, 'addProduct');
  const canViewCost = user && can(user.role, 'viewPurchasePrice');

  const saveEdit = () => {
    if (!editing) return;
    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === editing.id);
    if (idx !== -1) store.products[idx] = editing;
    saveStore(store);
    setEditing(null);
    load();
  };

  const saveNew = () => {
    const store = getStore();
    const prod: Product = {
      id: generateId('prod'),
      productCode: newProd.productCode ?? `${newProd.category?.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-4)}`,
      name: newProd.name ?? '',
      brand: newProd.brand ?? '',
      model: newProd.model,
      category: newProd.category ?? 'frame',
      color: newProd.color,
      size: newProd.size,
      purchasePrice: newProd.purchasePrice ?? 0,
      sellingPrice: newProd.sellingPrice ?? 0,
      mrp: newProd.mrp ?? 0,
      stock: newProd.stock ?? 0,
      lowStockThreshold: newProd.lowStockThreshold ?? 3,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    store.products.unshift(prod);
    saveStore(store);
    setShowAdd(false);
    setNewProd({ category: 'frame', status: 'active', stock: 0, lowStockThreshold: 3 });
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Products</div>
          <div className="adm-page-sub">{products.length} products total</div>
        </div>
        {canAdd && <button onClick={() => setShowAdd(true)} className="adm-btn adm-btn-primary"><Plus width={14} height={14} /> Add Product</button>}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 300 }}>
          <Search />
          <input className="adm-input" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {(['all', 'frame', 'lens', 'sunglass', 'service'] as const).map((c) => (
            <button key={c} className={`adm-tab${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)} style={{ fontSize: 12 }}>
              {c === 'all' ? 'All' : c === 'sunglass' ? 'Sunglasses' : CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Code</th><th>Name</th><th>Brand</th><th>Category</th>
              {canViewCost && <th>Cost</th>}
              <th>Price</th><th>Stock</th><th>Status</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{p.productCode}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  {p.color && <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.color}{p.size ? ` · ${p.size}` : ''}</div>}
                </td>
                <td style={{ color: '#475569' }}>{p.brand}</td>
                <td><span className="adm-badge adm-badge-gray">{CAT_LABELS[p.category]}</span></td>
                {canViewCost && <td style={{ color: '#64748b' }}>{fmt(p.purchasePrice)}</td>}
                <td style={{ fontWeight: 700 }}>{fmt(p.sellingPrice)}</td>
                <td>
                  <span className={`adm-badge ${p.stock === 0 ? 'adm-badge-danger' : p.stock <= p.lowStockThreshold ? 'adm-badge-warning' : 'adm-badge-success'}`}>
                    {p.stock === 0 ? 'Out' : p.stock}
                  </span>
                </td>
                <td><span className={`adm-badge ${p.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>{p.status}</span></td>
                {canEdit && (
                  <td>
                    <button onClick={() => setEditing({ ...p })} className="adm-btn adm-btn-ghost adm-btn-sm"><Edit2 width={13} height={13} /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="adm-overlay" onClick={() => setEditing(null)}>
          <div className="adm-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Edit Product</span>
              <button onClick={() => setEditing(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-grid-2" style={{ gap: 12 }}>
                {[['Name', 'name', 'text'], ['Brand', 'brand', 'text'], ['Color', 'color', 'text'], ['Size', 'size', 'text']].map(([label, field, type]) => (
                  <div key={field} className="adm-field">
                    <label className="adm-label">{label}</label>
                    <input className="adm-input" type={type} value={(editing as unknown as Record<string, string>)[field] ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, [field]: e.target.value } : null)} />
                  </div>
                ))}
                {canViewCost && (
                  <div className="adm-field">
                    <label className="adm-label">Purchase Price (₹)</label>
                    <input className="adm-input" type="number" value={editing.purchasePrice} onChange={(e) => setEditing((p) => p ? { ...p, purchasePrice: Number(e.target.value) } : null)} />
                  </div>
                )}
                <div className="adm-field">
                  <label className="adm-label">Selling Price (₹)</label>
                  <input className="adm-input" type="number" value={editing.sellingPrice} onChange={(e) => setEditing((p) => p ? { ...p, sellingPrice: Number(e.target.value) } : null)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">MRP (₹)</label>
                  <input className="adm-input" type="number" value={editing.mrp} onChange={(e) => setEditing((p) => p ? { ...p, mrp: Number(e.target.value) } : null)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Stock</label>
                  <input className="adm-input" type="number" value={editing.stock} onChange={(e) => setEditing((p) => p ? { ...p, stock: Number(e.target.value) } : null)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Low Stock Threshold</label>
                  <input className="adm-input" type="number" value={editing.lowStockThreshold} onChange={(e) => setEditing((p) => p ? { ...p, lowStockThreshold: Number(e.target.value) } : null)} />
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setEditing(null)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={saveEdit} className="adm-btn adm-btn-primary"><Save width={13} height={13} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="adm-overlay" onClick={() => setShowAdd(false)}>
          <div className="adm-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Add New Product</span>
              <button onClick={() => setShowAdd(false)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-grid-2" style={{ gap: 12 }}>
                <div className="adm-field">
                  <label className="adm-label">Category</label>
                  <select className="adm-select" value={newProd.category} onChange={(e) => setNewProd((p) => ({ ...p, category: e.target.value as ProductCategory }))}>
                    {(['frame', 'lens', 'sunglass', 'accessory', 'service'] as ProductCategory[]).map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="adm-field">
                  <label className="adm-label">Product Code</label>
                  <input className="adm-input" placeholder="Auto-generated if empty" value={newProd.productCode ?? ''} onChange={(e) => setNewProd((p) => ({ ...p, productCode: e.target.value }))} />
                </div>
                {[['Name *', 'name'], ['Brand *', 'brand'], ['Model', 'model'], ['Color', 'color'], ['Size', 'size']].map(([label, field]) => (
                  <div key={field} className="adm-field">
                    <label className="adm-label">{label}</label>
                    <input className="adm-input" value={(newProd as Record<string, string>)[field] ?? ''} onChange={(e) => setNewProd((p) => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
                <div className="adm-field">
                  <label className="adm-label">Purchase Price (₹)</label>
                  <input className="adm-input" type="number" value={newProd.purchasePrice ?? ''} onChange={(e) => setNewProd((p) => ({ ...p, purchasePrice: Number(e.target.value) }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Selling Price (₹)</label>
                  <input className="adm-input" type="number" value={newProd.sellingPrice ?? ''} onChange={(e) => setNewProd((p) => ({ ...p, sellingPrice: Number(e.target.value) }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">MRP (₹)</label>
                  <input className="adm-input" type="number" value={newProd.mrp ?? ''} onChange={(e) => setNewProd((p) => ({ ...p, mrp: Number(e.target.value) }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Opening Stock</label>
                  <input className="adm-input" type="number" value={newProd.stock ?? 0} onChange={(e) => setNewProd((p) => ({ ...p, stock: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setShowAdd(false)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={saveNew} className="adm-btn adm-btn-primary"><Plus width={13} height={13} /> Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
