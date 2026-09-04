'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Product, StockMovement, Purchase, Invoice } from '@/app/lib/admin/types';
import { can } from '@/app/lib/admin/permissions';
import {
  Search, AlertTriangle, Package, TrendingDown, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Plus, X, Save, CheckCircle, Calendar, RefreshCw, ShoppingCart, Truck
} from 'lucide-react';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'frame' | 'lens' | 'sunglass' | 'accessory'>('all');
  const [tab, setTab] = useState<'stock' | 'inward' | 'sales' | 'ledger' | 'low'>('stock');

  // Modals
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  // Inward Form State
  const [inwardProductId, setInwardProductId] = useState('');
  const [inwardQty, setInwardQty] = useState('');
  const [inwardSupplier, setInwardSupplier] = useState('');
  const [inwardBillNumber, setInwardBillNumber] = useState('');
  const [inwardCostPrice, setInwardCostPrice] = useState('');

  // Adjust Form State
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const store = getStore();
    setProducts(store.products.filter((p) => p.status === 'active'));
    setMovements(store.stockMovements.slice().reverse());
    setPurchases(store.purchases.slice().reverse());
    setInvoices(store.invoices.slice().reverse());
  };

  useEffect(load, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const q = query.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = products.filter((p) => p.stock === 0);

  // Key Inventory Metrics
  // 1. Current Stock on Hand
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);

  // 2. How much came in (Inward)
  const inwardMovements = movements.filter((m) => m.type === 'purchase' || m.quantity > 0);
  const totalUnitsInward = inwardMovements.reduce((sum, m) => sum + Math.max(0, m.quantity), 0);

  // 3. How much sold (Sales / Outward)
  const salesMovements = movements.filter((m) => m.type === 'sale' || m.quantity < 0);
  const totalUnitsSold = Math.abs(salesMovements.reduce((sum, m) => sum + Math.min(0, m.quantity), 0));

  // Also calculate total units sold across invoices for full consistency
  const totalInvoiceSoldUnits = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((iSum, item) => iSum + (item.category !== 'service' ? item.quantity : 0), 0);
  }, 0);

  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const canAdjust = user && can(user.role, 'adjustStock');

  // Handle Quick Inward (Stock Coming In)
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardProductId) {
      alert('Please select a product');
      return;
    }
    const qty = parseInt(inwardQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity received');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    const store = getStore();
    const pIdx = store.products.findIndex((p) => p.id === inwardProductId);
    if (pIdx !== -1) {
      const prod = store.products[pIdx];
      prod.stock += qty;
      if (inwardCostPrice && Number(inwardCostPrice) > 0) {
        prod.purchasePrice = Number(inwardCostPrice);
      }

      const refNo = inwardBillNumber.trim() ? `BILL-${inwardBillNumber.trim()}` : `INW-${Date.now().toString().slice(-6)}`;

      store.stockMovements.unshift({
        id: generateId('sm'),
        productId: prod.id,
        productName: prod.name,
        productCode: prod.productCode,
        type: 'purchase',
        quantity: qty,
        reference: refNo,
        reason: inwardSupplier.trim() ? `Supplier: ${inwardSupplier.trim()}` : 'Stock Received / Inward',
        createdBy: user?.name ?? 'Counter Staff',
        createdAt: new Date().toISOString(),
      });

      store.auditLogs.unshift({
        id: generateId('al'),
        action: 'STOCK_INWARD',
        entity: 'Product',
        entityId: prod.id,
        details: `Stock Inward: +${qty} units of ${prod.name} (Supplier: ${inwardSupplier || 'Direct'})`,
        performedBy: user?.name ?? '',
        performedByRole: user?.role ?? 'staff',
        createdAt: new Date().toISOString(),
      });

      saveStore(store);
    }

    setSaving(false);
    setShowInwardModal(false);
    setInwardProductId('');
    setInwardQty('');
    setInwardSupplier('');
    setInwardBillNumber('');
    setInwardCostPrice('');
    load();
  };

  // Handle Manual Stock Adjustment
  const handleAdjust = async () => {
    if (!adjustProduct) return;
    const qty = parseInt(adjQty);
    if (isNaN(qty) || !adjReason.trim()) {
      alert('Enter quantity and reason.');
      return;
    }
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
      {/* Header */}
      <div className="adm-page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="adm-page-title">Inventory & Stock System</div>
          <div className="adm-page-sub">Track stock coming in from suppliers, units sold at the counter, and current shop balance</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="adm-btn adm-btn-ghost adm-btn-sm" title="Refresh Stock Data">
            <RefreshCw width={14} height={14} /> Refresh
          </button>
          {canAdjust && (
            <button
              onClick={() => setShowInwardModal(true)}
              className="adm-btn adm-btn-primary adm-btn-sm"
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              <ArrowDownLeft width={14} height={14} /> + Receive Stock (Inward)
            </button>
          )}
        </div>
      </div>

      {/* ─── 4 Main Inventory Counters (Inward, Outward/Sales, Available, Low Stock) ─── */}
      <div className="adm-grid-4" style={{ marginBottom: 24 }}>
        {/* 1. Stock Inward (What came in) */}
        <div className="adm-stat" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="adm-stat-label">Stock Received (Inward)</div>
            <div className="adm-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <ArrowDownLeft width={18} height={18} />
            </div>
          </div>
          <div className="adm-stat-value" style={{ color: '#16a34a' }}>
            +{totalUnitsInward} units
          </div>
          <div className="adm-stat-sub">
            From supplier shipments & additions
          </div>
        </div>

        {/* 2. Stock Outward (How much sales) */}
        <div className="adm-stat" style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="adm-stat-label">Stock Sold (Outward Sales)</div>
            <div className="adm-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ArrowUpRight width={18} height={18} />
            </div>
          </div>
          <div className="adm-stat-value" style={{ color: '#2563eb' }}>
            -{Math.max(totalUnitsSold, totalInvoiceSoldUnits)} units
          </div>
          <div className="adm-stat-sub">
            {fmt(totalSalesRevenue)} generated in sales
          </div>
        </div>

        {/* 3. Stock on Hand (Available) */}
        <div className="adm-stat" style={{ borderLeft: '4px solid #fc5a06' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="adm-stat-label">Current Shop Stock</div>
            <div className="adm-stat-icon" style={{ background: '#fff7ed', color: '#fc5a06' }}>
              <Package width={18} height={18} />
            </div>
          </div>
          <div className="adm-stat-value">
            {totalStockUnits} units
          </div>
          <div className="adm-stat-sub">
            {products.length} active products in shop
          </div>
        </div>

        {/* 4. Stock Value / Alerts */}
        <div className="adm-stat" style={{ borderLeft: `4px solid ${lowStock.length > 0 || outOfStock.length > 0 ? '#d97706' : '#64748b'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="adm-stat-label">Stock Health & Alerts</div>
            <div className="adm-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle width={18} height={18} />
            </div>
          </div>
          <div className="adm-stat-value" style={{ color: outOfStock.length > 0 ? '#dc2626' : lowStock.length > 0 ? '#d97706' : '#16a34a' }}>
            {outOfStock.length > 0 ? `${outOfStock.length} Out of Stock` : lowStock.length > 0 ? `${lowStock.length} Low Stock` : 'Stock Healthy'}
          </div>
          <div className="adm-stat-sub">
            Value: {fmt(totalInventoryValue)} (Cost)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="adm-tabs">
          {[
            ['stock', `📦 Current Stock (${products.length})`],
            ['inward', `📥 Stock Inward (+${totalUnitsInward} units)`],
            ['sales', `📤 Sales Outward (-${Math.max(totalUnitsSold, totalInvoiceSoldUnits)} units)`],
            ['ledger', '🔄 Movement History'],
            ['low', `⚠️ Low/Out Alerts (${lowStock.length + outOfStock.length})`],
          ].map(([t, label]) => (
            <button
              key={t}
              className={`adm-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t as any)}
              style={{ fontSize: 13, fontWeight: tab === t ? 700 : 500 }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter for Current Stock Tab */}
        {tab === 'stock' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              className="adm-select"
              style={{ height: 38, width: 140, fontSize: 13 }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
            >
              <option value="all">All Categories</option>
              <option value="frame">Frames</option>
              <option value="lens">Lenses</option>
              <option value="sunglass">Sunglasses</option>
              <option value="accessory">Accessories</option>
            </select>
            <div className="adm-search-wrap" style={{ maxWidth: 240 }}>
              <Search />
              <input
                className="adm-input"
                placeholder="Search stock by code/name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ height: 38 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1: CURRENT STOCK ─── */}
      {tab === 'stock' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Purchase Cost</th>
                <th>Selling Price</th>
                <th>Available Units</th>
                <th>Stock Status</th>
                {canAdjust && <th>Quick Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                    No products matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{p.productCode}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {p.name}
                      {p.color && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> · {p.color}</span>}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-gray" style={{ textTransform: 'capitalize' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ color: '#475569' }}>{p.brand}</td>
                    <td style={{ color: '#64748b' }}>{fmt(p.purchasePrice)}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(p.sellingPrice)}</td>
                    <td>
                      <span
                        className={`adm-badge ${
                          p.stock === 0 ? 'adm-badge-danger' : p.stock <= p.lowStockThreshold ? 'adm-badge-warning' : 'adm-badge-success'
                        }`}
                        style={{ fontSize: 13, fontWeight: 700 }}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          p.stock === 0 ? 'adm-badge-danger' : p.stock <= p.lowStockThreshold ? 'adm-badge-warning' : 'adm-badge-success'
                        }`}
                      >
                        {p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockThreshold ? 'Low Stock' : 'Available'}
                      </span>
                    </td>
                    {canAdjust && (
                      <td>
                        <button
                          onClick={() => {
                            setAdjustProduct(p);
                            setAdjQty('');
                            setAdjReason('');
                          }}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          Adjust
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 2: INWARD STOCK (WHAT CAME IN) ─── */}
      {tab === 'inward' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowDownLeft width={20} height={20} style={{ color: '#16a34a' }} />
              <div>
                <strong style={{ color: '#166534', fontSize: 14 }}>Stock Inward Log</strong>
                <div style={{ fontSize: 12.5, color: '#15803d' }}>
                  All incoming stock delivered by suppliers and manual stock additions
                </div>
              </div>
            </div>
            {canAdjust && (
              <button
                onClick={() => setShowInwardModal(true)}
                className="adm-btn adm-btn-primary adm-btn-sm"
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
              >
                + Receive New Stock
              </button>
            )}
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Units Inward</th>
                  <th>Reference / Bill #</th>
                  <th>Source / Supplier</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                {inwardMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                      No inward stock recorded yet.
                    </td>
                  </tr>
                ) : (
                  inwardMovements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: 12.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.productName}</td>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{m.productCode}</td>
                      <td>
                        <span className="adm-badge adm-badge-success" style={{ fontWeight: 800, fontSize: 13 }}>
                          +{m.quantity} units
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#2563eb' }}>{m.reference || 'DIRECT-ADD'}</td>
                      <td style={{ color: '#475569' }}>{m.reason || 'Supplier Purchase'}</td>
                      <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALES OUTWARD (WHAT WAS SOLD) ─── */}
      {tab === 'sales' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowUpRight width={20} height={20} style={{ color: '#2563eb' }} />
              <div>
                <strong style={{ color: '#1e40af', fontSize: 14 }}>Stock Sales & Outward Log</strong>
                <div style={{ fontSize: 12.5, color: '#1d4ed8' }}>
                  Every item deducted upon customer purchase across POS and Counter bills
                </div>
              </div>
            </div>
            <Link href="/admin/invoices" className="adm-btn adm-btn-secondary adm-btn-sm">
              View All Invoices
            </Link>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Product Sold</th>
                  <th>Category</th>
                  <th>Units Deducted</th>
                  <th>Selling Price</th>
                  <th>Processed By</th>
                </tr>
              </thead>
              <tbody>
                {salesMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                      No sales stock deductions recorded yet.
                    </td>
                  </tr>
                ) : (
                  salesMovements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: 12.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <Link href={`/admin/invoices`} style={{ fontWeight: 700, color: '#fc5a06', textDecoration: 'none' }}>
                          {m.reference || 'SALE'}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.productName}</td>
                      <td>
                        <span className="adm-badge adm-badge-gray">{m.productCode}</span>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-danger" style={{ fontWeight: 800, fontSize: 13 }}>
                          {m.quantity} unit{Math.abs(m.quantity) !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>Sold</td>
                      <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: COMPLETE LEDGER ─── */}
      {tab === 'ledger' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Code</th>
                <th>Movement Type</th>
                <th>Change (Qty)</th>
                <th>Reference</th>
                <th>Notes / Reason</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.productName}</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{m.productCode}</td>
                    <td>
                      <span
                        className={`adm-badge ${
                          m.type === 'purchase'
                            ? 'adm-badge-success'
                            : m.type === 'sale'
                            ? 'adm-badge-info'
                            : m.type === 'damage'
                            ? 'adm-badge-danger'
                            : 'adm-badge-warning'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {m.type === 'purchase' ? '📥 Inward (+)' : m.type === 'sale' ? '📤 Sale (-)' : m.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: 13.5, color: m.quantity > 0 ? '#16a34a' : '#dc2626' }}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#475569', fontFamily: 'monospace' }}>{m.reference ?? '—'}</td>
                    <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.reason ?? '—'}</td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{m.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 5: LOW / OUT OF STOCK ALERTS ─── */}
      {tab === 'low' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Supplier Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...outOfStock, ...lowStock].length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#16a34a', padding: 32, fontWeight: 600 }}>
                    ✓ Excellent! All products are well stocked above their threshold.
                  </td>
                </tr>
              ) : (
                [...outOfStock, ...lowStock].map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', color: '#475569' }}>{p.productCode}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                    <td style={{ color: '#475569' }}>{p.brand}</td>
                    <td>
                      <span className={`adm-badge ${p.stock === 0 ? 'adm-badge-danger' : 'adm-badge-warning'}`} style={{ fontWeight: 800 }}>
                        {p.stock} units left
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{p.lowStockThreshold} units</td>
                    <td style={{ color: '#64748b' }}>{fmt(p.purchasePrice)}</td>
                    <td>
                      <button
                        onClick={() => {
                          setInwardProductId(p.id);
                          setInwardCostPrice(String(p.purchasePrice));
                          setShowInwardModal(true);
                        }}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        + Order / Receive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── RECEIVE STOCK MODAL (INWARD) ─── */}
      {showInwardModal && (
        <div className="adm-overlay" onClick={() => setShowInwardModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowDownLeft width={20} height={20} style={{ color: '#16a34a' }} />
                <span className="adm-modal-title" style={{ color: '#166534' }}>Receive Stock (Inward)</span>
              </div>
              <button onClick={() => setShowInwardModal(false)} className="adm-btn adm-btn-ghost adm-btn-sm">
                <X width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleReceiveStock}>
              <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="adm-field">
                  <label className="adm-label">Select Product to Receive *</label>
                  <select
                    className="adm-select"
                    value={inwardProductId}
                    onChange={(e) => {
                      setInwardProductId(e.target.value);
                      const found = products.find((p) => p.id === e.target.value);
                      if (found) setInwardCostPrice(String(found.purchasePrice));
                    }}
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productCode} — {p.name} ({p.brand}) · Current Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="adm-field">
                    <label className="adm-label">Units Received (Quantity) *</label>
                    <input
                      className="adm-input"
                      type="number"
                      placeholder="e.g. 20"
                      value={inwardQty}
                      onChange={(e) => setInwardQty(e.target.value)}
                      required
                      min={1}
                      style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}
                    />
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Cost Price / Unit (₹)</label>
                    <input
                      className="adm-input"
                      type="number"
                      placeholder="Cost price"
                      value={inwardCostPrice}
                      onChange={(e) => setInwardCostPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="adm-field">
                    <label className="adm-label">Supplier Name (Optional)</label>
                    <input
                      className="adm-input"
                      placeholder="e.g. Essilor / Ray-Ban Dist."
                      value={inwardSupplier}
                      onChange={(e) => setInwardSupplier(e.target.value)}
                    />
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Supplier Bill # / PO #</label>
                    <input
                      className="adm-input"
                      placeholder="e.g. INV-88219"
                      value={inwardBillNumber}
                      onChange={(e) => setInwardBillNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" onClick={() => setShowInwardModal(false)} className="adm-btn adm-btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="adm-btn adm-btn-primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <ArrowDownLeft width={14} height={14} /> {saving ? 'Adding to Stock…' : 'Add to Stock (Inward)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADJUST STOCK MODAL ─── */}
      {adjustProduct && (
        <div className="adm-overlay" onClick={() => setAdjustProduct(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Adjust Stock — {adjustProduct.name}</span>
              <button onClick={() => setAdjustProduct(null)} className="adm-btn adm-btn-ghost adm-btn-sm">
                <X width={14} height={14} />
              </button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 14 }}>
                Current Stock on Hand: <strong>{adjustProduct.stock} units</strong>
              </div>
              <div className="adm-field">
                <label className="adm-label">Stock Change (+ or −)</label>
                <input
                  className="adm-input"
                  type="number"
                  placeholder="e.g. -2 for damaged, or +5 for found stock"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 700 }}
                />
                <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Negative = remove stock, Positive = add stock</span>
              </div>
              <div className="adm-field">
                <label className="adm-label">Reason *</label>
                <input
                  className="adm-input"
                  placeholder="e.g. Physical inventory check, damaged frame, returned"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setAdjustProduct(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button onClick={handleAdjust} disabled={saving} className="adm-btn adm-btn-primary">
                <Save width={13} height={13} /> {saving ? 'Saving…' : 'Save Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
