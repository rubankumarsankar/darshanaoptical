'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, saveStore } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Invoice, OrderStatus } from '@/app/lib/admin/types';
import { Phone, Search, CheckCircle } from 'lucide-react';

const ORDER_STATUSES: OrderStatus[] = ['new', 'lens_ordered', 'in_process', 'ready', 'delivered', 'cancelled'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  lens_ordered: 'Lens Ordered',
  in_process: 'In Process',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'adm-badge-info',
  lens_ordered: 'adm-badge-orange',
  in_process: 'adm-badge-warning',
  ready: 'adm-badge-success',
  delivered: 'adm-badge-gray',
  cancelled: 'adm-badge-danger',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    const store = getStore();
    setOrders(store.invoices.filter((i) => i.orderStatus != null).slice().reverse());
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const q = query.toLowerCase();
    const matchQ = !q || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || o.invoiceNumber.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const updateStatus = (invoiceId: string, status: OrderStatus) => {
    setUpdating(invoiceId);
    const store = getStore();
    const idx = store.invoices.findIndex((i) => i.id === invoiceId);
    if (idx !== -1) {
      store.invoices[idx].orderStatus = status;
      if (status === 'delivered') store.invoices[idx].deliveredAt = new Date().toISOString();
      store.auditLogs.unshift({
        id: `al-${Date.now()}`,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Invoice',
        entityId: invoiceId,
        details: `Order status → ${STATUS_LABELS[status]} for ${store.invoices[idx].customerName}`,
        performedBy: user?.name ?? 'Unknown',
        performedByRole: user?.role ?? 'staff',
        createdAt: new Date().toISOString(),
      });
      saveStore(store);
      load();
    }
    setUpdating(null);
    load();
  };

  const countByStatus = (s: OrderStatus) => orders.filter((o) => o.orderStatus === s).length;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Orders</div>
          <div className="adm-page-sub">Track prescription glasses from order to delivery</div>
        </div>
      </div>

      {/* Status counts */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {ORDER_STATUSES.filter((s) => s !== 'cancelled').map((s) => {
          const count = countByStatus(s);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`adm-badge ${STATUS_COLORS[s]}`}
              style={{
                cursor: 'pointer', border: statusFilter === s ? '2px solid currentColor' : '2px solid transparent',
                padding: '5px 14px', fontSize: 12.5, fontWeight: 600,
              }}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <Search />
          <input className="adm-input" placeholder="Search by customer, phone, invoice…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Invoice #</th>
              <th>Frame</th>
              <th>Lens</th>
              <th>Order Date</th>
              <th>Expected</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No orders found.</td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <a href={`tel:${order.customerPhone}`} style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Phone width={11} height={11} />{order.customerPhone}
                    </a>
                  </td>
                  <td>
                    <Link href={`/admin/invoices/${order.id}`} style={{ color: '#fc5a06', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>
                      {order.invoiceNumber}
                    </Link>
                  </td>
                  <td style={{ fontSize: 13, color: '#475569' }}>{order.frameProduct ?? '—'}</td>
                  <td style={{ fontSize: 13, color: '#475569' }}>{order.lensProduct ?? '—'}</td>
                  <td style={{ fontSize: 12.5, color: '#94a3b8' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ fontSize: 12.5, color: order.expectedDate && new Date(order.expectedDate) < new Date() && order.orderStatus !== 'delivered' ? '#dc2626' : '#94a3b8', fontWeight: order.expectedDate && new Date(order.expectedDate) < new Date() ? 600 : 400 }}>
                    {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td>
                    <select
                      className="adm-select"
                      value={order.orderStatus ?? 'new'}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updating === order.id}
                      style={{ width: 'auto', minWidth: 130, height: 32, fontSize: 12.5, padding: '0 28px 0 8px' }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/invoices/${order.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">View</Link>
                      {order.orderStatus === 'ready' && (
                        <button onClick={() => updateStatus(order.id, 'delivered')} className="adm-btn adm-btn-sm" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          <CheckCircle width={12} height={12} /> Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
