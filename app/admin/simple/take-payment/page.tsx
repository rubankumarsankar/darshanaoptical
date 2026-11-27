'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { initials, inr, money, payNow, shortDate } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import StepWizard from '../_ui/StepWizard';
import { ChoiceCard, DoneScreen, EmptyState, ErrorNote, PageHead, WhatsAppButton } from '../_ui/parts';

interface Due {
  customer_id: string;
  name: string;
  phone: string;
  owed: number;
  bills: number;
  since: string;
}

type Amount = 'full' | 'half' | 'other';
type Method = 'cash' | 'upi' | 'card';
const STEPS = ['Who is paying?', 'How much?'] as const;

export default function TakePaymentPage() {
  return (
    <Suspense>
      <TakePayment />
    </Suspense>
  );
}

function TakePayment() {
  const params = useSearchParams();
  const preselect = params.get('customer');
  const handover = params.get('handover');

  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading, error: loadError } = useAdminFetch<{ dues: Due[] }>('/api/admin/simple/dues', {
    params: preselect && !debounced ? { customer: preselect } : { q: debounced },
  });

  const [chosenStep, setStep] = useState<number | null>(null);
  const [picked, setWho] = useState<Due | null>(null);
  const [amount, setAmount] = useState<Amount>('full');
  const [other, setOther] = useState('');
  const [method, setMethod] = useState<Method>('cash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ received: number; still: number; handedOver: boolean } | null>(null);

  // Arriving from "Got paid" or "Hand over" with a customer: skip the list.
  const preselected = preselect ? data?.dues.find((d) => d.customer_id === preselect) : undefined;
  const who = picked ?? preselected ?? null;
  const step = chosenStep ?? (preselected ? 1 : 0);

  const owed = who?.owed ?? 0;
  const value = amount === 'other' ? money(Number(other) || 0) : payNow(owed, amount);
  const valid = step === 0 ? !!who : value > 0 && value <= owed;

  const save = async () => {
    if (!who) return;
    setBusy(true);
    setError('');
    try {
      const res = await adminPost<{ received: number; still_owed: number }>('/api/admin/simple/payments', { customer_id: who.customer_id, amount: value, method });
      // Came here from "Hand over" and it's now fully paid: finish the hand-over too.
      let handedOver = false;
      if (handover && res.still_owed <= 0) {
        await adminPut(`/api/admin/invoices/${encodeURIComponent(handover)}`, { order_status: 'delivered' });
        handedOver = true;
      }
      setDone({ received: res.received, still: res.still_owed, handedOver });
    } catch (err: any) {
      setError(err.message ?? 'The payment could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  if (done && who) {
    const receipt = `Hello ${who.name}, we received ${inr(done.received)} by ${method === 'upi' ? 'UPI' : method} at Darshana Optical. ${done.still > 0 ? `Still to pay: ${inr(done.still)}.` : 'Your bill is fully paid.'} Thank you!`;
    return (
      <>
        <PageHead title="Take payment" />
        <section className={s.card}>
          <DoneScreen
            title={`${inr(done.received)} received`}
            detail={`${who.name} · ${done.still > 0 ? `${inr(done.still)} still to pay.` : 'Nothing left to pay.'}${done.handedOver ? ' Glasses handed over.' : ''}`}
          >
            <WhatsAppButton phone={who.phone} text={receipt} className={`${s.btn} ${s.btnBig} ${s.btnGreen}`}>
              Send receipt on WhatsApp
            </WhatsAppButton>
            <Link href={handover ? '/admin/simple/orders?tab=ready' : '/admin/simple'} className={`${s.btn} ${s.btnBig} ${s.btnSoft}`}>
              Done
            </Link>
          </DoneScreen>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title="Take payment">
        <Link href="/admin/simple" style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '12px 0' }}>
          Cancel
        </Link>
      </PageHead>

      <StepWizard steps={STEPS} current={step} canNext={valid} onBack={() => setStep(0)} onNext={() => (step === 0 ? setStep(1) : void save())} finishLabel="Save payment" busy={busy}>
        {step === 0 && (
          <>
            <h2 className={s.h2}>Who is paying?</h2>
            <label className={`${s.search} ${s.searchSoft}`}>
              <Search size={22} color="#5E606A" aria-hidden />
              <span className={s.srOnly}>Name, phone or bill number</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or bill number" autoFocus />
            </label>
            <ErrorNote>{loadError}</ErrorNote>
            <div role="radiogroup" aria-label="Customers who owe" className={s.stack} style={{ gap: 10 }}>
              {loading && !data && <EmptyState>Loading…</EmptyState>}
              {data && data.dues.length === 0 && <EmptyState>{debounced ? `No one owes money for “${debounced}”.` : 'Nobody owes the shop anything right now.'}</EmptyState>}
              {data?.dues.map((d) => (
                <ChoiceCard
                  key={d.customer_id}
                  radio
                  selected={who?.customer_id === d.customer_id}
                  onSelect={() => {
                    setWho(d);
                    setAmount('full');
                  }}
                  leading={
                    <span aria-hidden style={{ width: 48, height: 48, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {initials(d.name)}
                    </span>
                  }
                  title={d.name}
                  sub={`${d.phone} · ${d.bills} bill${d.bills === 1 ? '' : 's'} since ${shortDate(d.since)}`}
                  trailing={<strong style={{ fontSize: 19 }}>{inr(d.owed)}</strong>}
                />
              ))}
            </div>
          </>
        )}

        {step === 1 && who && (
          <>
            <div className={s.row} style={{ justifyContent: 'space-between', gap: 16, padding: '22px 24px', borderRadius: 24, background: 'var(--charcoal)', color: '#fff' }}>
              <span style={{ fontSize: 18 }}>{who.name} owes</span>
              <strong style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--orange)' }}>{inr(owed)}</strong>
            </div>
            <div className={s.stack} style={{ gap: 12 }}>
              <h2 className={s.h3}>How much are they paying?</h2>
              <div role="radiogroup" aria-label="Amount" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <ChoiceCard radio selected={amount === 'full'} onSelect={() => setAmount('full')} title="Full" sub={inr(owed)} />
                <ChoiceCard radio selected={amount === 'half'} onSelect={() => setAmount('half')} title="Half" sub={inr(payNow(owed, 'half'))} />
                <ChoiceCard radio selected={amount === 'other'} onSelect={() => setAmount('other')} title="Other" sub="Type the amount" />
              </div>
              {amount === 'other' && (
                <label className={s.field} style={{ maxWidth: 320 }}>
                  Amount in ₹
                  <input className={s.input} type="number" inputMode="decimal" min={1} max={owed} step="0.01" value={other} onChange={(e) => setOther(e.target.value)} autoFocus />
                  {value > owed && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>That’s more than they owe.</span>}
                </label>
              )}
            </div>
            <div className={s.stack} style={{ gap: 12 }}>
              <h2 className={s.h3}>Paid by</h2>
              <div role="radiogroup" aria-label="Paid by" className={s.grid} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', maxWidth: 560 }}>
                {(['cash', 'upi', 'card'] as const).map((m) => (
                  <ChoiceCard key={m} radio selected={method === m} onSelect={() => setMethod(m)} title={m === 'upi' ? 'UPI' : m[0].toUpperCase() + m.slice(1)} />
                ))}
              </div>
            </div>
            <ErrorNote>{error}</ErrorNote>
          </>
        )}
      </StepWizard>
    </>
  );
}
