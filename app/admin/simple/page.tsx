'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Eye, Plus, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { canSeeMoney, greeting, inr, longDate, shopDay } from '@/app/lib/admin/simple';
import s from './_ui/simple.module.css';
import { AttentionRow, BigActionTile, EmptyState, ErrorNote, MoneyStat } from './_ui/parts';

interface HomeData {
  attention: {
    late_orders: number;
    arrived: { id: number; name: string; time: string | null }[];
    booked_today: number;
    ready_not_told: number;
    low_stock: number;
    new_messages: number;
  };
  today?: { sold: number; bills: number; received: number; to_collect: number; owing_customers: number };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const ring = { size: 28, strokeWidth: 2.2, 'aria-hidden': true } as const;

export default function SimpleHome() {
  const router = useRouter();
  const { role } = useAuth();
  const { data, loading, error } = useAdminFetch<HomeData>('/api/admin/simple/home');
  const [find, setFind] = useState('');

  const onFind = (e: FormEvent) => {
    e.preventDefault();
    const q = find.trim();
    router.push(q ? `/admin/simple/customers?q=${encodeURIComponent(q)}` : '/admin/simple/customers');
  };

  const a = data?.attention;
  const rows: { key: string; text: string; action: string; href: string; tone: 'late' | 'now' | 'ready' | 'low' }[] = [];
  if (a) {
    if (a.late_orders > 0)
      rows.push({ key: 'late', text: `${plural(a.late_orders, 'order is', 'orders are')} late from the lab.`, action: 'See orders', href: '/admin/simple/orders?tab=lab', tone: 'late' });
    for (const b of a.arrived)
      rows.push({
        key: `arrived-${b.id}`,
        text: `${b.name} is here for ${b.time ? `the ${b.time} ` : 'an '}eye test.`,
        action: 'Start test',
        href: `/admin/simple/eye-test?booking=${b.id}`,
        tone: 'now',
      });
    if (a.booked_today > 0)
      rows.push({ key: 'booked', text: `${plural(a.booked_today, 'eye test is', 'eye tests are')} booked for today.`, action: 'See bookings', href: '/admin/simple/bookings', tone: 'now' });
    if (a.new_messages > 0)
      rows.push({ key: 'messages', text: `${plural(a.new_messages, 'new message', 'new messages')} from the website.`, action: 'Read messages', href: '/admin/simple/bookings?view=messages', tone: 'now' });
    if (a.ready_not_told > 0)
      rows.push({ key: 'ready', text: `${plural(a.ready_not_told, 'pair of glasses is', 'pairs of glasses are')} ready. Tell the customers.`, action: 'Send WhatsApp', href: '/admin/simple/orders?tab=ready', tone: 'ready' });
    if (a.low_stock > 0)
      rows.push({ key: 'low', text: `${plural(a.low_stock, 'item is', 'items are')} running low.`, action: 'See stock', href: '/admin/simple/stock', tone: 'low' });
  }

  return (
    <>
      <div className={s.pageHead}>
        <div style={{ flex: '1 1 260px' }}>
          <h1 className={s.h1}>{greeting()}</h1>
          <p className={s.sub}>{longDate(shopDay())}</p>
        </div>
        <form role="search" onSubmit={onFind} style={{ flex: '1 1 360px' }}>
          <label className={s.search}>
            <Search size={22} color="#5E606A" aria-hidden />
            <span className={s.srOnly}>Find a customer</span>
            <input type="search" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find a customer by name or phone" />
          </label>
        </form>
      </div>

      <section aria-labelledby="todo-title" className={s.stack} style={{ gap: 14 }}>
        <div className={s.row} style={{ justifyContent: 'space-between', gap: 10 }}>
          <h2 id="todo-title" className={s.h3}>
            What do you want to do?
          </h2>
          <Link href="/admin/simple/bills" style={{ fontSize: 16, fontWeight: 700, padding: '8px 0' }}>
            Find a bill →
          </Link>
        </div>
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <BigActionTile primary href="/admin/simple/sale" title="New sale" sub="Bill a customer in 4 easy steps" icon={<Plus {...ring} />} />
          <BigActionTile href="/admin/simple/eye-test" title="Eye test" sub="Save a new prescription" icon={<Eye {...ring} />} />
          <BigActionTile href="/admin/simple/take-payment" title="Take payment" sub="Customer paying a balance" icon={<CreditCard {...ring} />} />
          <BigActionTile href="/admin/simple/orders?tab=ready" title="Hand over glasses" sub="Order is ready for pickup" icon={<Check {...ring} />} />
        </div>
      </section>

      {canSeeMoney(role) && data?.today && (
        <section aria-label="Today" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MoneyStat label="Sold today" value={inr(data.today.sold)} note={plural(data.today.bills, 'bill', 'bills')} />
          <MoneyStat label="Money received" value={inr(data.today.received)} note="Cash · UPI · Card" />
          <MoneyStat
            warm
            href="/admin/simple/money"
            label="Still to collect"
            value={inr(data.today.to_collect)}
            note={`${plural(data.today.owing_customers, 'customer', 'customers')} · See list →`}
          />
        </section>
      )}

      <section aria-labelledby="attention-title" className={s.stack} style={{ gap: 12 }}>
        <h2 id="attention-title" className={s.h3}>
          Needs your attention
        </h2>
        <ErrorNote>{error && `Couldn't load today's list: ${error}`}</ErrorNote>
        {loading && !data && <EmptyState>Checking what needs doing…</EmptyState>}
        {data && rows.length === 0 && <EmptyState>All caught up. Nothing needs your attention right now.</EmptyState>}
        {rows.map((r) => (
          <AttentionRow key={r.key} text={r.text} action={r.action} href={r.href} tone={r.tone} />
        ))}
      </section>
    </>
  );
}
