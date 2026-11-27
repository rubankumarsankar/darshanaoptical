'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { CATEGORY_WORDS, EXPENSE_WORDS, inr, monthName, recentMonths, shopDay } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead } from '../_ui/parts';

interface Report {
  month: string;
  sold: number;
  bills: number;
  spent: number;
  kept: number;
  change: { sold: number | null; kept: number | null };
  by_category: { category: string; total: number }[];
  by_expense: { category: string; total: number }[];
}

function Bars({ rows, words, label }: { rows: { category: string; total: number }[]; words: Record<string, string>; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  if (rows.length === 0) return <p className={s.help}>Nothing yet this month.</p>;
  return (
    <div className={s.bars} role="list" aria-label={label}>
      {rows.map((r) => (
        <div key={r.category} className={s.barRow} role="listitem">
          <span style={{ fontWeight: 600 }}>{words[r.category] ?? r.category}</span>
          <span className={s.barTrack} aria-hidden>
            <span className={s.barFill} style={{ display: 'block', width: `${(r.total / max) * 100}%` }} />
          </span>
          <strong>{inr(r.total)}</strong>
        </div>
      ))}
    </div>
  );
}

function Change({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span style={{ fontWeight: 700, color: up ? 'var(--success-text)' : 'var(--danger)' }}>
      {up ? '▲' : '▼'} {Math.abs(value)}% vs last month
    </span>
  );
}

export default function MonthlyReportPage() {
  const months = recentMonths(shopDay().slice(0, 7));
  const [month, setMonth] = useState(months[0]);
  const { data, loading, error } = useAdminFetch<Report>('/api/admin/simple/report', { params: { month } });

  const sentence = data
    ? `In ${monthName(data.month)} you sold ${inr(data.sold)} across ${data.bills} bill${data.bills === 1 ? '' : 's'}. After expenses of ${inr(data.spent)}, you kept ${inr(data.kept)}.`
    : '';
  const summary = data
    ? [
        `Darshana Optical — ${monthName(data.month, true)}`,
        sentence,
        data.change.sold !== null ? `Sales ${data.change.sold >= 0 ? 'up' : 'down'} ${Math.abs(data.change.sold)}% on last month.` : '',
        data.by_category.length ? `Top seller: ${CATEGORY_WORDS[data.by_category[0].category] ?? data.by_category[0].category} (${inr(data.by_category[0].total)}).` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return (
    <>
      <PageHead title="Monthly report">
        <Link href="/admin/simple/money" style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '12px 0' }}>
          ← Money
        </Link>
      </PageHead>

      <div role="tablist" aria-label="Month" className={s.row} style={{ gap: 8 }}>
        {months.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={month === m} className={s.chip} onClick={() => setMonth(m)}>
            {monthName(m)}
          </button>
        ))}
      </div>

      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <EmptyState>Working out the numbers…</EmptyState>}

      {data && (
        <>
          <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontFamily: 'var(--display)', fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 600, lineHeight: 1.35 }}>{sentence}</p>
            <div className={s.row} style={{ gap: 18 }}>
              <span>
                Sales <Change value={data.change.sold} />
              </span>
              <span>
                Kept <Change value={data.change.kept} />
              </span>
            </div>
          </section>

          <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className={s.h3}>What sold most</h2>
              <Bars rows={data.by_category} words={CATEGORY_WORDS} label="Sales by category" />
            </section>
            <section className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className={s.h3}>Where money went</h2>
              <Bars rows={data.by_expense} words={EXPENSE_WORDS} label="Expenses by category" />
            </section>
          </div>

          <div className={s.row} style={{ gap: 12 }}>
            <button type="button" className={`${s.btn} ${s.btnDark}`} onClick={() => window.print()}>
              Download PDF
            </button>
            {/* No number: WhatsApp asks which chat to send the summary to. */}
            <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`}>
              Send to my WhatsApp
            </a>
          </div>
        </>
      )}
    </>
  );
}
