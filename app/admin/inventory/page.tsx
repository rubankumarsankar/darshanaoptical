'use client';

import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

const MOVEMENT_LABELS: Record<string, string> = {
  purchase: 'Purchase', sale: 'Sale', damage: 'Damage', return: 'Return', adjustment: 'Adjustment',
};
const MOVEMENT_COLORS: Record<string, string> = {
  purchase: 'adm-badge-success', sale: 'adm-badge-info', damage: 'adm-badge-danger',
  return: 'adm-badge-warning', adjustment: 'adm-badge-gray',
};

export default function InventoryPage() {
  const { data, loading } = useAdminFetch<{ products: any[]; movements: any[] }>('/api/admin/inventory');
  const products = data?.products ?? [];
  const movements = data?.movements ?? [];

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((s, p) => s + Number(p.stock) * Number(p.purchase_price), 0);

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Inventory</div>
      </div>

      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        <div className="adm-stat">
          <div className="adm-stat-label">Total Products</div>
          <div className="adm-stat-value">{products.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Inventory Value</div>
          <div className="adm-stat-value" style={{ fontSize: 18, color: '#16a34a' }}>{fmt(totalValue)}</div>
        </div>
        <div className="adm-stat" style={{ borderLeft: '3px solid #d97706' }}>
          <div className="adm-stat-label">Low Stock</div>
          <div className="adm-stat-value" style={{ color: '#d97706' }}>{lowStock.length}</div>
        </div>
        <div className="adm-stat" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="adm-stat-label">Out of Stock</div>
          <div className="adm-stat-value" style={{ color: '#ef4444' }}>{outOfStock.length}</div>
        </div>
      </div>

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>
            <AlertTriangle size={15} /> Stock Alerts
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {outOfStock.map((p) => (
              <div key={p.id} style={{ background: '#fee2e2', borderRadius: 6, padding: '4px 10px', fontSize: 12.5, color: '#991b1b', fontWeight: 600 }}>
                {p.name} — OUT OF STOCK
              </div>
            ))}
            {lowStock.map((p) => (
              <div key={p.id} style={{ background: '#fef3c7', borderRadius: 6, padding: '4px 10px', fontSize: 12.5, color: '#92400e', fontWeight: 600 }}>
                {p.name} — {p.stock} left
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="adm-grid-2">
        {/* Product Stock Table */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Current Stock</div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Value</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Loading…</td></tr>
                : products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{p.brand}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.category}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: p.stock === 0 ? '#ef4444' : p.stock <= p.low_stock_threshold ? '#d97706' : '#16a34a' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{fmt(Number(p.stock) * Number(p.purchase_price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movements */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Recent Movements</div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Date</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Loading…</td></tr>
                : movements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{m.product_name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.product_code}</div>
                    </td>
                    <td><span className={`adm-badge ${MOVEMENT_COLORS[m.type] ?? 'adm-badge-gray'}`}>{MOVEMENT_LABELS[m.type] ?? m.type}</span></td>
                    <td style={{ fontWeight: 700, color: m.quantity > 0 ? '#16a34a' : '#ef4444' }}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td style={{ fontSize: 11.5, color: '#94a3b8' }}>{new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
