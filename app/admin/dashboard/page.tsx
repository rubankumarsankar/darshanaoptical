'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { getStore } from '@/app/lib/admin/store';
import type { AdminStore } from '@/app/lib/admin/types';
import {
  TrendingUp, Users, Eye, ShoppingCart, AlertTriangle, Package, ArrowRight,
  CheckCircle, Clock, IndianRupee, Receipt, RefreshCw, Zap, UserPlus, User,
} from 'lucide-react';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'adm-badge-success',
    partially_paid: 'adm-badge-warning',
    pending: 'adm-badge-danger',
    cancelled: 'adm-badge-gray',
    new: 'adm-badge-info',
    lens_ordered: 'adm-badge-orange',
    in_process: 'adm-badge-warning',
    ready: 'adm-badge-success',
    delivered: 'adm-badge-gray',
  };
  const labels: Record<string, string> = {
    paid: 'Paid', partially_paid: 'Part Paid', pending: 'Pending', cancelled: 'Cancelled',
    new: 'New', lens_ordered: 'Lens Ordered', in_process: 'In Process', ready: 'Ready', delivered: 'Delivered',
  };
  return <span className={`adm-badge ${map[status] ?? 'adm-badge-gray'}`}>{labels[status] ?? status}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<AdminStore | null>(null);

  useEffect(() => {
    setStore(getStore());
  }, []);

  if (!store || !user) return null;

  const today = new Date().toISOString().slice(0, 10);

  // Today's metrics
  const todayInvoices = store.invoices.filter((i) => i.createdAt.startsWith(today));
  const todaySales = todayInvoices.reduce((s, i) => s + i.total, 0);
  const todayReceived = todayInvoices.reduce((s, i) => s + i.paid, 0);
  const todayPending = todayInvoices.reduce((s, i) => s + i.balance, 0);
  const todayEyeTests = store.eyeTests.filter((e) => e.createdAt.startsWith(today));
  const todayCustomers = store.customers.filter((c) => c.createdAt.startsWith(today));

  // Inventory alerts
  const lowStock = store.products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = store.products.filter((p) => p.stock === 0 && p.status === 'active');
  const inventoryValue = store.products.reduce((s, p) => s + p.purchasePrice * p.stock, 0);

  // Pending orders
  const pendingOrders = store.invoices.filter((i) => i.orderStatus && !['delivered', 'cancelled'].includes(i.orderStatus ?? ''));

  // Pending payments
  const pendingPayments = store.invoices.filter((i) => i.balance > 0 && i.status !== 'cancelled');

  // This month
  const month = today.slice(0, 7);
  const monthInvoices = store.invoices.filter((i) => i.createdAt.startsWith(month));
  const monthSales = monthInvoices.reduce((s, i) => s + i.total, 0);
  const monthExpenses = store.expenses.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      {/* ─── Standard Shop Workflow Flowchart ─────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fc5a06', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              Standard Shop Flow
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Daily 4-Step Optical Counter Process
            </div>
          </div>
          <Link
            href="/admin/counter"
            className="adm-btn adm-btn-primary"
            style={{
              background: 'linear-gradient(135deg, #fc5a06 0%, #ea580c 100%)',
              boxShadow: '0 4px 14px rgba(252,90,6,0.35)',
              gap: 8,
              fontWeight: 700,
              fontSize: 13.5,
              height: 40,
              padding: '0 18px',
            }}
          >
            <Zap width={16} height={16} /> 1-Screen Express Counter
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {/* Step 1 */}
          <Link
            href="/admin/customers/new"
            style={{
              textDecoration: 'none',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#fc5a06'; (e.currentTarget as HTMLAnchorElement).style.background = '#fffaf7'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#fc5a06', background: '#fff0e8', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>STEP 1</span>
              <User width={16} height={16} style={{ color: '#fc5a06' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>1. Customer</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Lookup or Register Mobile</div>
          </Link>

          {/* Step 2 */}
          <Link
            href="/admin/eye-tests/new"
            style={{
              textDecoration: 'none',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLAnchorElement).style.background = '#f0f7ff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>STEP 2</span>
              <Eye width={16} height={16} style={{ color: '#2563eb' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>2. Eye Testing</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Record OD / OS Powers</div>
          </Link>

          {/* Step 3 */}
          <Link
            href="/admin/pos"
            style={{
              textDecoration: 'none',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.background = '#f0fdf4'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>STEP 3</span>
              <ShoppingCart width={16} height={16} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>3. Billing / POS</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Select Frame + Lens + Pay</div>
          </Link>

          {/* Step 4 */}
          <Link
            href="/admin/orders"
            style={{
              textDecoration: 'none',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#7c3aed'; (e.currentTarget as HTMLAnchorElement).style.background = '#faf5ff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>STEP 4</span>
              <Package width={16} height={16} style={{ color: '#7c3aed' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>4. Lab & Delivery</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Fitting status & Handover</div>
          </Link>
        </div>
      </div>

      {/* Today's Stats */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Today — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</h2>
          <button onClick={() => setStore(getStore())} className="adm-btn adm-btn-ghost adm-btn-sm">
            <RefreshCw width={13} height={13} />
          </button>
        </div>
        <div className="adm-grid-4">
          <StatCard
            label="Total Sales"
            value={fmt(todaySales)}
            icon={<IndianRupee width={18} height={18} />}
            color="#fc5a06"
            sub={`${todayInvoices.length} invoice${todayInvoices.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="Amount Received"
            value={fmt(todayReceived)}
            icon={<CheckCircle width={18} height={18} />}
            color="#16a34a"
            sub="Cash + UPI + Card"
          />
          <StatCard
            label="Pending Balance"
            value={fmt(todayPending)}
            icon={<Clock width={18} height={18} />}
            color={todayPending > 0 ? '#d97706' : '#94a3b8'}
            sub={`${pendingPayments.length} outstanding`}
          />
          <StatCard
            label="Eye Tests"
            value={String(todayEyeTests.length)}
            icon={<Eye width={18} height={18} />}
            color="#2563eb"
            sub={`${todayCustomers.length} new customer${todayCustomers.length !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* Alerts Row */}
      {(lowStock.length > 0 || outOfStock.length > 0 || pendingPayments.length > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {outOfStock.length > 0 && (
            <div className="adm-alert adm-alert-danger" style={{ flex: 1, minWidth: 200 }}>
              <AlertTriangle width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>{outOfStock.length} product{outOfStock.length > 1 ? 's' : ''}</strong> out of stock</span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="adm-alert adm-alert-warning" style={{ flex: 1, minWidth: 200 }}>
              <AlertTriangle width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>{lowStock.length} item{lowStock.length > 1 ? 's' : ''}</strong> running low on stock</span>
            </div>
          )}
          {pendingPayments.length > 0 && (
            <div className="adm-alert adm-alert-info" style={{ flex: 1, minWidth: 200 }}>
              <Clock width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>{pendingPayments.length} customer{pendingPayments.length > 1 ? 's' : ''}</strong> have pending balances</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Recent Invoices */}
        <div className="adm-card" style={{ gridColumn: '1 / -1' }}>
          <div className="adm-card-header">
            <Receipt width={15} height={15} style={{ color: '#fc5a06' }} />
            <span className="adm-card-title">Recent Invoices</span>
            <Link href="/admin/invoices" className="adm-btn adm-btn-ghost adm-btn-sm">
              View All <ArrowRight width={13} height={13} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {store.invoices.slice().reverse().slice(0, 6).map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.customerName}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.customerPhone}</div>
                    </td>
                    <td style={{ color: '#64748b' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                    <td style={{ color: inv.balance > 0 ? '#d97706' : '#94a3b8', fontWeight: inv.balance > 0 ? 700 : 400 }}>
                      {inv.balance > 0 ? fmt(inv.balance) : '—'}
                    </td>
                    <td><Badge status={inv.status} /></td>
                    <td>{inv.orderStatus ? <Badge status={inv.orderStatus} /> : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Pending Orders */}
        <div className="adm-card">
          <div className="adm-card-header">
            <ShoppingCart width={15} height={15} style={{ color: '#2563eb' }} />
            <span className="adm-card-title">Pending Orders</span>
            <Link href="/admin/orders" className="adm-btn adm-btn-ghost adm-btn-sm">
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
          <div className="adm-card-body" style={{ padding: '12px 0' }}>
            {pendingOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 20px' }}>No pending orders</p>
            ) : (
              pendingOrders.slice(0, 5).map((inv) => (
                <div key={inv.id} style={{ padding: '10px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{inv.customerName}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                      {inv.frameProduct ?? ''} {inv.lensProduct ? `· ${inv.lensProduct}` : ''}
                    </div>
                  </div>
                  <Badge status={inv.orderStatus ?? 'new'} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="adm-card">
          <div className="adm-card-header">
            <Package width={15} height={15} style={{ color: '#d97706' }} />
            <span className="adm-card-title">Stock Alerts</span>
            <Link href="/admin/inventory" className="adm-btn adm-btn-ghost adm-btn-sm">
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
          <div className="adm-card-body" style={{ padding: '12px 0' }}>
            {[...outOfStock, ...lowStock].slice(0, 5).map((prod) => (
              <div key={prod.id} style={{ padding: '10px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{prod.productCode}</div>
                </div>
                <span className={`adm-badge ${prod.stock === 0 ? 'adm-badge-danger' : 'adm-badge-warning'}`}>
                  {prod.stock === 0 ? 'Out' : `${prod.stock} left`}
                </span>
              </div>
            ))}
            {lowStock.length === 0 && outOfStock.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 20px' }}>All products in stock ✓</p>
            )}
          </div>
        </div>

        {/* Monthly Business */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <div className="adm-card">
            <div className="adm-card-header">
              <TrendingUp width={15} height={15} style={{ color: '#16a34a' }} />
              <span className="adm-card-title">This Month</span>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MetricRow label="Sales" value={fmt(monthSales)} color="#fc5a06" />
              <MetricRow label="Expenses" value={fmt(monthExpenses)} color="#dc2626" />
              {user.role === 'admin' && (
                <MetricRow label="Est. Profit" value={fmt(monthSales - monthExpenses)} color="#16a34a" />
              )}
              <div style={{ paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <MetricRow label="Inventory Value" value={fmt(inventoryValue)} color="#2563eb" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Link href="/admin/reports" className="adm-btn adm-btn-secondary adm-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  Full Report
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/pos" className="adm-btn adm-btn-primary"><ShoppingCart width={14} height={14} /> New Sale</Link>
          <Link href="/admin/customers/new" className="adm-btn adm-btn-secondary"><Users width={14} height={14} /> New Customer</Link>
          <Link href="/admin/eye-tests/new" className="adm-btn adm-btn-secondary"><Eye width={14} height={14} /> New Eye Test</Link>
          <Link href="/admin/orders" className="adm-btn adm-btn-secondary"><ShoppingCart width={14} height={14} /> View Orders</Link>
          {user.role !== 'staff' && (
            <Link href="/admin/expenses" className="adm-btn adm-btn-secondary"><Package width={14} height={14} /> Add Expense</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-icon" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value" style={{ fontSize: 24 }}>{value}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
