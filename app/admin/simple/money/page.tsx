'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { EXPENSE_WORDS, inr, shopDay, shortDate, waLink, type Period } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, MoneyStat, PageHead } from '../_ui/parts';

interface MoneyData {
  money_in: number;
  money_out: number;
  kept: number;
  owing: { customer_id: string; name: string; phone: string; owed: number; since: string }[];
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

export default function MoneyPage() {
  const [period, setPeriod] = useState<Period>('today');
  const { data, loading, error, refetch } = useAdminFetch<MoneyData>('/api/admin/simple/money', { params: { period } });

  return (
    <>
      <PageHead title="Money">
        <Link href="/admin/simple/report" className={`${s.btn} ${s.btnDark}`}>
          Monthly report
        </Link>
      </PageHead>

      <div role="tablist" aria-label="Period" className={s.row} style={{ gap: 8 }}>
        {PERIODS.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={period === p.id} className={s.chip} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <ErrorNote>{error}</ErrorNote>

      <section aria-label="Totals" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MoneyStat label="Money in" value={loading && !data ? '…' : inr(data?.money_in)} note="Payments received" />
        <MoneyStat label="Money out" value={loading && !data ? '…' : inr(data?.money_out)} note="Expenses" />
        <MoneyStat warm label="You kept" value={loading && !data ? '…' : inr(data?.kept)} note="Money in − money out" />
      </section>

      <div className={s.row} style={{ alignItems: 'flex-start', gap: 20 }}>
        <section aria-labelledby="owe-title" className={s.stack} style={{ flex: '2 1 420px', gap: 12, minWidth: 0 }}>
          <h2 id="owe-title" className={s.h3}>
            Customers who owe you
          </h2>
          {data && data.owing.length === 0 && <EmptyState>Nobody owes you anything right now.</EmptyState>}
          {data?.owing.map((o) => {
            const remind = waLink(o.phone, `Hello ${o.name}, a gentle reminder from Darshana Optical: ${inr(o.owed)} is still to be paid. You can pay at the shop or by UPI. Thank you!`);
            return (
              <div key={o.customer_id} className={s.attention} style={{ padding: '14px 18px' }}>
                <span style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 18 }}>{o.name}</strong>
                  <span className={s.muted} style={{ fontSize: 15 }}>
                    Since {shortDate(o.since)} · {o.phone}
                  </span>
                </span>
                <strong style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{inr(o.owed)}</strong>
                {remind && (
                  <a href={remind} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnLight}`}>
                    Remind
                  </a>
                )}
                <Link href={`/admin/simple/take-payment?customer=${encodeURIComponent(o.customer_id)}`} className={`${s.btn} ${s.btnDark}`}>
                  Got paid
                </Link>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="expense-title" style={{ flex: '1 1 320px', minWidth: 0 }}>
          <AddExpense onSaved={() => void refetch()} />
        </section>
      </div>
    </>
  );
}

function AddExpense({ onSaved }: { onSaved: () => void }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [method, setMethod] = useState<'cash' | 'upi'>('cash');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const value = Number(amount);
  const ok = value > 0 && !!category;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ok || !category) return;
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await adminPost('/api/admin/expenses', {
        expense_date: shopDay(),
        category,
        amount: value,
        payment_method: method,
        description: note.trim() || EXPENSE_WORDS[category],
      });
      setSaved(`${inr(value)} for ${EXPENSE_WORDS[category].toLowerCase()} saved.`);
      setAmount('');
      setCategory(null);
      setNote('');
      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'The expense could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 id="expense-title" className={s.h3}>
        Add an expense
      </h2>
      <label className={s.field}>
        Amount in ₹
        <input className={s.input} type="number" inputMode="decimal" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </label>
      <div role="radiogroup" aria-label="What was it for?" className={s.stack} style={{ gap: 8 }}>
        <span style={{ fontWeight: 700 }}>What was it for?</span>
        <div className={s.row} style={{ gap: 8 }}>
          {Object.entries(EXPENSE_WORDS).map(([id, words]) => (
            <button key={id} type="button" role="radio" aria-checked={category === id} className={s.chip} onClick={() => setCategory(id)}>
              {words}
            </button>
          ))}
        </div>
      </div>
      <div role="radiogroup" aria-label="Paid by" className={s.row} style={{ gap: 8 }}>
        {(['cash', 'upi'] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={method === m} className={s.chip} onClick={() => setMethod(m)}>
            {m === 'upi' ? 'UPI' : 'Cash'}
          </button>
        ))}
      </div>
      <label className={s.field}>
        <span>
          Note <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
        </span>
        <input className={s.input} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
      </label>
      <ErrorNote>{error}</ErrorNote>
      {saved && (
        <p role="status" style={{ margin: 0, color: 'var(--success-text)', fontWeight: 700 }}>
          {saved}
        </p>
      )}
      <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={!ok || busy}>
        {busy ? 'Saving…' : 'Save expense'}
      </button>
    </form>
  );
}
