'use client';

import { useEffect, useState } from 'react';
import { getStore } from '@/app/lib/admin/store';
import type { AdminStore } from '@/app/lib/admin/types';
import { BarChart2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

function MonthData(store: AdminStore, month: string) {
  const invoices = store.invoices.filter((i) => i.createdAt.startsWith(month) && i.status !== 'cancelled');
  const expenses = store.expenses.filter((e) => e.date.startsWith(month));
  const sales = invoices.reduce((s, i) => s + i.total, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);
  const expTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const eyeTests = store.eyeTests.filter((e) => e.date.startsWith(month)).length;
  const customers = new Set(invoices.map((i) => i.customerId)).size;
  return { sales, collected, expenses: expTotal, profit: sales - expTotal, eyeTests, customers, invoiceCount: invoices.length };
}

export default function ReportsPage() {
  const [store, setStore] = useState<AdminStore | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const s = getStore();
    setStore(s);
    // Generate last 6 months
    const m: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      m.push(d.toISOString().slice(0, 7));
    }
    setMonths(m);
  }, []);

  if (!store) return null;

  const data = MonthData(store, selectedMonth);

  // Top products this month
  const monthInvoices = store.invoices.filter((i) => i.createdAt.startsWith(selectedMonth) && i.status !== 'cancelled');
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const inv of monthInvoices) {
    for (const item of inv.items) {
      if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].revenue += item.total;
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Expense breakdown
  const expBreakdown: Record<string, number> = {};
  store.expenses.filter((e) => e.date.startsWith(selectedMonth)).forEach((e) => {
    expBreakdown[e.category] = (expBreakdown[e.category] ?? 0) + e.amount;
  });

  const monthLabel = (m: string) => {
    const [year, month] = m.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Reports</div>
        <div className="adm-tabs">
          {months.map((m) => (
            <button key={m} className={`adm-tab${selectedMonth === m ? ' active' : ''}`} onClick={() => setSelectedMonth(m)} style={{ fontSize: 12 }}>
              {monthLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Month Summary */}
      <div className="adm-grid-4" style={{ marginBottom: 24 }}>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#fff8e6', color: '#d97706' }}><BarChart2 width={18} height={18} /></div>
          <div className="adm-stat-label">Total Sales</div>
          <div className="adm-stat-value" style={{ fontSize: 22 }}>{fmt(data.sales)}</div>
          <div className="adm-stat-sub">{data.invoiceCount} invoice{data.invoiceCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><TrendingUp width={18} height={18} /></div>
          <div className="adm-stat-label">Collected</div>
          <div className="adm-stat-value" style={{ fontSize: 22, color: '#16a34a' }}>{fmt(data.collected)}</div>
          <div className="adm-stat-sub">Cash received</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><TrendingDown width={18} height={18} /></div>
          <div className="adm-stat-label">Expenses</div>
          <div className="adm-stat-value" style={{ fontSize: 22, color: '#dc2626' }}>{fmt(data.expenses)}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon" style={{ background: data.profit > 0 ? '#f0fdf4' : '#fef2f2', color: data.profit > 0 ? '#16a34a' : '#dc2626' }}><TrendingUp width={18} height={18} /></div>
          <div className="adm-stat-label">Est. Profit</div>
          <div className="adm-stat-value" style={{ fontSize: 22, color: data.profit > 0 ? '#16a34a' : '#dc2626' }}>{fmt(data.profit)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Activity */}
        <div className="adm-card">
          <div className="adm-card-header"><Calendar width={14} height={14} style={{ color: '#2563eb' }} /><span className="adm-card-title">Activity — {monthLabel(selectedMonth)}</span></div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Customers Served', data.customers, '#fc5a06'],
              ['Eye Tests Done', data.eyeTests, '#2563eb'],
              ['Invoices Created', data.invoiceCount, '#16a34a'],
            ].map(([label, value, color]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, color: '#475569' }}>{label as string}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: color as string }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="adm-card">
          <div className="adm-card-header"><TrendingDown width={14} height={14} style={{ color: '#dc2626' }} /><span className="adm-card-title">Expense Breakdown</span></div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.keys(expBreakdown).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0', fontSize: 13 }}>No expenses this month</div>
            ) : (
              Object.entries(expBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = Math.round((amt / data.expenses) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, color: '#475569', textTransform: 'capitalize' }}>{cat}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{fmt(amt)} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#dc2626', borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="adm-card">
          <div className="adm-card-header"><BarChart2 width={14} height={14} style={{ color: '#fc5a06' }} /><span className="adm-card-title">Top Products — {monthLabel(selectedMonth)}</span></div>
          <table className="adm-table">
            <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name}>
                  <td style={{ color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{p.qty}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
