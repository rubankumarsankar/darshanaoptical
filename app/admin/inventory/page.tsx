'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Product, StockMovement } from '@/app/lib/admin/types';
import { can } from '@/app/lib/admin/permissions';
import { Search, AlertTriangle, Package, TrendingDown, X, Save } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'low' | 'out' | 'movements'>('all');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const store = getStore();
    setProducts(store.products.filter((p) => p.status === 'active'));
    setMovements(store.stockMovements.slice().reverse().slice(0, 50));
  };
  useEffect(load, []);

  const allProds = products.filter((p) => {
    const q = query.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });
  const lowStock = allProds.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = allProds.filter((p) => p.stock === 0);
  const inventoryValue = products.reduce((s, p) => s + p.purchasePrice * p.stock, 0);

  const displayProds = tab === 'all' ? allProds : tab === 'low' ? lowStock : outOfStock;

  const canAdjust = user && can(user.role, 'adjustStock');

  const handleAdjust = async () => {
    if (!adjustProduct) return;
    const qty = parseInt(adjQty);
    if (isNaN(qty) || !adjReason.trim()) { alert('Enter quantity and reason.'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));
    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === adjustProduct.id);
    if (idx !== -1) {
      const oldStock = store.products[idx].stock;
      store.products[idx].stock = Math.max(0, oldStock + qty);
      store.stockMovements.unshift({
        id: generateId('sm'),
        productId: adjustProduct.id,
        productName: adjustProduct.name,
        productCode: adjustProduct.productCode,
        type: 'adjustment',
        quantity: qty,
        reason: adjReason,
        createdBy: user?.name ?? '',
        createdAt: new Date().toISOString(),
      });
      store.auditLogs.unshift({
        id: generateId('al'),
        action: 'STOCK_ADJUSTED',
        entity: 'Product',
        entityId: adjustProduct.id,
        details: `Stock adjusted: ${adjustProduct.name} — ${oldStock} → ${oldStock + qty} (${adjReason})`,
        performedBy: user?.name ?? '',
        performedByRole: user?.role ?? 'staff',
        createdAt: new Date().toISOString(),
      });
      saveStore(store);
    }
    setSaving(false);
    setAdjustProduct(null);
    setAdjQty('');
    setAdjReason('');
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Inventory</div>
          <div className="adm-page-sub">{products.length} active products</div>
        </div>
      </div>

      {/* Summary */}
      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Package width={18} height={18} /></div>
          <div className="adm-stat-label">Total Products</div>
          <div className="adm-stat-value">{products.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#fff8e6', color: '#d97706' }}><AlertTriangle width={18} height={18} /></div>
          <div className="adm-stat-label">Low Stock</div>
          <div className="adm-stat-value" style={{ color: '#d97706' }}>{lowStock.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><TrendingDown width={18} height={18} /></div>
          <div className="adm-stat-label">Out of Stock</div>
          <div className="adm-stat-value" style={{ color: '#dc2626' }}>{outOfStock.length}</div>
        </div>
        {user && can(user.role, 'viewInventoryValue') && (
          <div className="adm-stat">
            <div className="adm-stat-label">Inventory Value</div>
            <div className="adm-stat-value" style={{ fontSize: 20 }}>{fmt(inventoryValue)}</div>
            <div className="adm-stat-sub">(at purchase price)</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 300 }}>
          <Search />
          <input className="adm-input" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {([['all', 'All Products'], ['low', `Low Stock (${lowStock.length})`], ['out', `Out of Stock (${outOfStock.length})`], ['movements', 'Stock History']] as const).map(([t, label]) => (
            <button key={t} className={`adm-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ fontSize: 12 }}>{label}</button>
          ))}
        </div>
      </div>

      {tab !== 'movements' ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Code</th><th>Product</th><th>Brand</th><th>Category</th><th>Current Stock</th><th>Threshold</th><th>Status</th>{canAdjust && <th>Adjust</th>}</tr></thead>
            <tbody>
              {displayProds.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No products.</td></tr>
              ) : displayProds.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{p.productCode}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}{p.color ? <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> · {p.color}</span> : null}</td>
                  <td style={{ color: '#475569' }}>{p.brand}</td>
                  <td><span className="adm-badge adm-badge-gray" style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                  <td>
                    <span className={`adm-badge ${p.stock === 0 ? 'adm-badge-danger' : p.stock <= p.lowStockThreshold ? 'adm-badge-warning' : 'adm-badge-success'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{p.lowStockThreshold}</td>
                  <td><span className={`adm-badge ${p.stock === 0 ? 'adm-badge-danger' : p.stock <= p.lowStockThreshold ? 'adm-badge-warning' : 'adm-badge-success'}`}>{p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock'}</span></td>
                  {canAdjust && (
                    <td><button onClick={() => { setAdjustProduct(p); setAdjQty(''); setAdjReason(''); }} className="adm-btn adm-btn-secondary adm-btn-sm">Adjust</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Reference</th><th>Reason</th><th>By</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.productName}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{m.productCode}</div>
                  </td>
                  <td><span className={`adm-badge ${m.type === 'purchase' ? 'adm-badge-success' : m.type === 'sale' ? 'adm-badge-info' : m.type === 'damage' ? 'adm-badge-danger' : 'adm-badge-warning'}`} style={{ textTransform: 'capitalize' }}>{m.type}</span></td>
                  <td style={{ fontWeight: 700, color: m.quantity > 0 ? '#16a34a' : '#dc2626' }}>{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.reference ?? '—'}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.reason ?? '—'}</td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{m.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustProduct && (
        <div className="adm-overlay" onClick={() => setAdjustProduct(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Adjust Stock — {adjustProduct.name}</span>
              <button onClick={() => setAdjustProduct(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 14 }}>
                Current Stock: <strong>{adjustProduct.stock} units</strong>
              </div>
              <div className="adm-field">
                <label className="adm-label">Adjustment (+/−)</label>
                <input className="adm-input" type="number" placeholder="e.g. -2 or +5" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} autoFocus />
                <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Negative = remove stock, Positive = add stock</span>
              </div>
              <div className="adm-field">
                <label className="adm-label">Reason *</label>
                <input className="adm-input" placeholder="e.g. Physical stock check — damaged unit" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setAdjustProduct(null)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={handleAdjust} disabled={saving} className="adm-btn adm-btn-primary"><Save width={13} height={13} /> Adjust Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
