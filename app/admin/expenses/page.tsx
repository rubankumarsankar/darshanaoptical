'use client';

import { useEffect, useState } from 'react';
import { getStore, saveStore, generateId } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Expense, ExpenseCategory, PaymentMethod } from '@/app/lib/admin/types';
import { Plus, X } from 'lucide-react';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

const CAT_LABELS: Record<ExpenseCategory, string> = {
  rent: 'Rent', electricity: 'Electricity', salary: 'Salary', transport: 'Transport',
  maintenance: 'Maintenance', marketing: 'Marketing', supplies: 'Supplies', other: 'Other',
};
const CAT_COLORS: Record<ExpenseCategory, string> = {
  rent: 'adm-badge-danger', electricity: 'adm-badge-warning', salary: 'adm-badge-info',
  transport: 'adm-badge-gray', maintenance: 'adm-badge-orange', marketing: 'adm-badge-success',
  supplies: 'adm-badge-gray', other: 'adm-badge-gray',
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: 'rent' as ExpenseCategory, amount: '', paymentMethod: 'cash' as PaymentMethod, description: '', reference: '' });

  const load = () => setExpenses(getStore().expenses.slice().reverse());
  useEffect(load, []);

  const filtered = expenses.filter((e) => catFilter === 'all' || e.category === catFilter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = expenses.filter((e) => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    const amount = parseFloat(form.amount);
    if (!amount || !form.description.trim()) { alert('Fill all required fields.'); return; }
    const store = getStore();
    store.expenses.unshift({
      id: generateId('exp'),
      date: form.date,
      category: form.category,
      amount,
      paymentMethod: form.paymentMethod,
      description: form.description,
      reference: form.reference || undefined,
      createdBy: user?.name ?? '',
      createdAt: new Date().toISOString(),
    });
    saveStore(store);
    setShowAdd(false);
    setForm({ date: new Date().toISOString().slice(0, 10), category: 'rent', amount: '', paymentMethod: 'cash', description: '', reference: '' });
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Expenses</div>
          <div className="adm-page-sub">This month: {fmt(monthTotal)}</div>
        </div>
        <button onClick={() => setShowAdd(true)} className="adm-btn adm-btn-primary"><Plus width={14} height={14} /> Add Expense</button>
      </div>

      <div className="adm-grid-3" style={{ marginBottom: 20 }}>
        <div className="adm-stat"><div className="adm-stat-label">Showing Total</div><div className="adm-stat-value" style={{ fontSize: 20, color: '#dc2626' }}>{fmt(total)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">This Month</div><div className="adm-stat-value" style={{ fontSize: 20 }}>{fmt(monthTotal)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Total Entries</div><div className="adm-stat-value">{expenses.length}</div></div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setCatFilter('all')} className={`adm-badge ${catFilter === 'all' ? 'adm-badge-info' : 'adm-badge-gray'}`} style={{ cursor: 'pointer', border: '2px solid transparent' }}>All</button>
        {(Object.keys(CAT_LABELS) as ExpenseCategory[]).map((cat) => (
          <button key={cat} onClick={() => setCatFilter(cat)} className={`adm-badge ${catFilter === cat ? CAT_COLORS[cat] : 'adm-badge-gray'}`} style={{ cursor: 'pointer', border: '2px solid transparent' }}>{CAT_LABELS[cat]}</button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Method</th><th>Reference</th><th>By</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No expenses found.</td></tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`adm-badge ${CAT_COLORS[e.category]}`}>{CAT_LABELS[e.category]}</span></td>
                  <td style={{ color: '#475569' }}>{e.description}</td>
                  <td style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</td>
                  <td style={{ color: '#64748b', textTransform: 'capitalize' }}>{e.paymentMethod}</td>
                  <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{e.reference ?? '—'}</td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{e.createdBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="adm-overlay" onClick={() => setShowAdd(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Add Expense</span>
              <button onClick={() => setShowAdd(false)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="adm-grid-2" style={{ gap: 12 }}>
                <div className="adm-field">
                  <label className="adm-label">Date</label>
                  <input className="adm-input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Category</label>
                  <select className="adm-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}>
                    {(Object.entries(CAT_LABELS) as [ExpenseCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Description *</label>
                <input className="adm-input" placeholder="What is this expense for?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="adm-grid-2" style={{ gap: 12 }}>
                <div className="adm-field">
                  <label className="adm-label">Amount (₹) *</label>
                  <input className="adm-input" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Payment Method</label>
                  <select className="adm-select" value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Reference</label>
                <input className="adm-input" placeholder="Bill number, receipt number, etc." value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setShowAdd(false)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={handleAdd} className="adm-btn adm-btn-primary"><Plus width={13} height={13} /> Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
