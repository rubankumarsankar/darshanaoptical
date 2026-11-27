'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import {
  discountCap,
  initials,
  inr,
  longDate,
  payNow,
  saleStepValid,
  saleTotals,
  shopDay,
  shortDate,
  type PayChoice,
} from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import StepWizard from '../_ui/StepWizard';
import { ChoiceCard, DoneScreen, ErrorNote, PageHead, Stepper, WhatsAppButton } from '../_ui/parts';
import NewCustomerForm, { type NewCustomer } from '../_ui/NewCustomerForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  last_visit?: string | null;
}

interface EyeTest {
  id: string;
  test_date: string;
  re_sph: string | null;
  re_cyl: string | null;
  le_sph: string | null;
  le_cyl: string | null;
}

interface Product {
  id: string;
  product_code: string;
  name: string;
  brand: string;
  category: 'frame' | 'lens' | 'sunglass' | 'accessory' | 'service';
  selling_price: string | number;
  stock: number;
  status: string;
}

interface CartLine {
  product_id: string;
  name: string;
  code: string;
  category: Product['category'];
  price: number;
  qty: number;
  stock: number;
}

type Rx = 'last' | 'new' | 'none';
type Method = 'cash' | 'upi' | 'card';

interface Draft {
  customer: Customer | null;
  cart: CartLine[];
  discount: number;
}

const STEPS = ['Customer', 'Eye power', 'Items', 'Payment'] as const;
const DRAFT_KEY = 'simple-sale-draft';
const CATEGORY_LABEL: Record<Product['category'], string> = {
  frame: 'Frame',
  lens: 'Lens',
  sunglass: 'Sunglasses',
  accessory: 'Accessory',
  service: 'Service',
};
const SHELVES: { id: 'all' | Product['category']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'frame', label: 'Frames' },
  { id: 'lens', label: 'Lenses' },
  { id: 'sunglass', label: 'Sunglasses' },
  { id: 'accessory', label: 'Other' },
  { id: 'service', label: 'Services' },
];

const powerLine = (t: EyeTest) =>
  `${shortDate(t.test_date)} · Right ${[t.re_sph, t.re_cyl].filter(Boolean).join(' / ') || '—'} · Left ${[t.le_sph, t.le_cyl].filter(Boolean).join(' / ') || '—'}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalePage() {
  return (
    <Suspense>
      <SaleWizard />
    </Suspense>
  );
}

function SaleWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { role } = useAuth();
  const { data: settingsData } = useAdminFetch<{ settings: any }>('/api/admin/settings');
  const { data: productData } = useAdminFetch<{ products: Product[] }>('/api/admin/products', { params: { status: 'active' } });

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tests, setTests] = useState<EyeTest[]>([]);
  const [rx, setRx] = useState<Rx | null>(null);
  const [eyeTestId, setEyeTestId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [pay, setPay] = useState<PayChoice | null>('full');
  const [other, setOther] = useState('');
  const [labChoice, setLabChoice] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<Method | null>('upi');
  const [readyBy, setReadyBy] = useState(() => shopDay(3));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ number: string; total: number; paid: number; balance: number } | null>(null);

  const settings = settingsData?.settings;
  const taxRate = settings?.tax_enabled ? Number(settings.tax_rate ?? 0) : 0;
  const cap = role ? discountCap(role, settings) : 0;
  const totals = saleTotals(cart, discount, taxRate);
  // Lenses usually go to the lab; staff can switch that either way.
  const needsLab = labChoice ?? cart.some((l) => l.category === 'lens');
  const otherAmount = Number(other) || 0;

  // Arriving from an eye test (?customer=…&eyeTest=…): pick up the customer and
  // that test, restore any bill already started, and go straight to Items.
  useEffect(() => {
    const ref = params.get('customer');
    if (!ref) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(ref)}`);
      if (!res.ok || cancelled) return;
      const json = await res.json();
      setCustomer(json.customer);
      setTests(json.eyeTests ?? []);
      const linked = params.get('eyeTest');
      if (linked) {
        setRx('last');
        setEyeTestId(linked);
        setStep(2);
      } else {
        setStep(1);
      }
      if (params.get('resume')) {
        try {
          const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as Draft | null;
          if (draft && draft.customer?.id === json.customer.id) {
            setCart(draft.cart);
            setDiscount(draft.discount);
          }
        } catch {
          // A corrupt draft just means starting the bill again.
        }
        sessionStorage.removeItem(DRAFT_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const chooseCustomer = async (c: Customer) => {
    setCustomer(c);
    setRx(null);
    setEyeTestId(null);
    setTests([]);
    const res = await fetch(`/api/admin/customers/${encodeURIComponent(c.id)}`);
    if (res.ok) {
      const json = await res.json();
      const list: EyeTest[] = json.eyeTests ?? [];
      setTests(list);
      if (list[0]) {
        setRx('last');
        setEyeTestId(list[0].id);
      }
    }
  };

  const startEyeTest = () => {
    if (!customer) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ customer, cart, discount } satisfies Draft));
    router.push(`/admin/eye-test?customer=${encodeURIComponent(customer.id)}&from=sale`);
  };

  const addProduct = (p: Product) => {
    setCart((prev) => {
      const hit = prev.find((l) => l.product_id === p.id);
      if (hit) {
        if (p.category !== 'service' && hit.qty >= p.stock) return prev;
        return prev.map((l) => (l.product_id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product_id: p.id, name: p.name, code: p.product_code, category: p.category, price: Number(p.selling_price), qty: 1, stock: p.stock }];
    });
  };

  const valid = saleStepValid(step, {
    customerId: customer?.id ?? null,
    rx,
    eyeTestId,
    lines: cart.length,
    discount,
    cap,
    pay,
    method,
    needsLab,
    readyBy,
    otherAmount,
    total: totals.total,
  });

  const save = async () => {
    if (!customer || !pay) return;
    setSaving(true);
    setError('');
    const paid = payNow(totals.total, pay, otherAmount);
    try {
      const res = await adminPost<{ invoice: any; invoice_number: string }>('/api/admin/invoices', {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        eye_test_id: rx === 'last' ? eyeTestId : null,
        // Only the product id and quantity matter: the server looks up the real
        // name, price and category itself.
        items: cart.map((l) => ({ product_id: l.product_id, product_name: l.name, product_code: l.code, category: l.category, quantity: l.qty, unit_price: l.price })),
        discount_percent: discount,
        payment_method: paid > 0 ? method : undefined,
        amount_paid: paid,
        has_order: needsLab,
        expected_date: needsLab ? readyBy : null,
        frame_product: cart.filter((l) => l.category === 'frame').map((l) => l.name).join(', ') || null,
        lens_product: cart.filter((l) => l.category === 'lens').map((l) => l.name).join(', ') || null,
        notes: note.trim() || null,
      });
      setDone({
        number: res.invoice_number,
        total: Number(res.invoice?.total ?? totals.total),
        paid: Number(res.invoice?.paid ?? paid),
        balance: Number(res.invoice?.balance ?? totals.total - paid),
      });
    } catch (err: any) {
      setError(err.message ?? 'The bill could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (!valid) return;
    if (step === STEPS.length - 1) void save();
    else setStep(step + 1);
  };

  const restart = () => {
    setDone(null);
    setStep(0);
    setCustomer(null);
    setTests([]);
    setRx(null);
    setEyeTestId(null);
    setCart([]);
    setDiscount(0);
    setPay('full');
    setOther('');
    setLabChoice(null);
    setNote('');
    setMethod('upi');
    setReadyBy(shopDay(3));
    router.replace('/admin/sale');
  };

  if (done && customer) {
    const billText = [
      `Hello ${customer.name}, thank you for visiting Darshana Optical.`,
      `Bill ${done.number}`,
      ...cart.map((l) => `• ${l.name}${l.qty > 1 ? ` × ${l.qty}` : ''}: ${inr(l.price * l.qty)}`),
      discount > 0 ? `Discount: ${discount}%` : '',
      `Total: ${inr(done.total)}`,
      `Paid: ${inr(done.paid)}`,
      done.balance > 0 ? `Balance to pay: ${inr(done.balance)}` : 'Fully paid.',
      needsLab ? `Your glasses will be ready by ${longDate(readyBy)}.` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return (
      <>
        <PageHead title="New sale" />
        <section className={s.card}>
          <DoneScreen
            title="Bill saved"
            detail={`${done.number} · ${customer.name} · ${inr(done.total)}. ${done.balance > 0 ? `Balance ${inr(done.balance)} to collect on pickup.` : 'Fully paid.'}`}
          >
            <WhatsAppButton phone={customer.phone} text={billText} className={`${s.btn} ${s.btnBig} ${s.btnGreen}`}>
              Send bill on WhatsApp
            </WhatsAppButton>
            <Link href={`/admin/bills/${encodeURIComponent(done.number.toLowerCase())}?print=invoice`} className={`${s.btn} ${s.btnBig} ${s.btnDark}`}>
              Print bill
            </Link>
            <button type="button" className={`${s.btn} ${s.btnBig} ${s.btnSoft}`} onClick={restart}>
              Start another sale
            </button>
          </DoneScreen>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title="New sale">
        <Link href="/admin" style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '12px 0' }}>
          Cancel
        </Link>
      </PageHead>

      <StepWizard steps={STEPS} current={step} canNext={valid} onBack={() => setStep(Math.max(0, step - 1))} onNext={next} finishLabel="Save bill" busy={saving}>
        {step === 0 && <CustomerStep selected={customer} onSelect={chooseCustomer} />}

        {step === 1 && (
          <>
            <h2 className={s.h2}>Which eye power should we use?</h2>
            <div role="radiogroup" aria-label="Eye power" className={s.stack} style={{ gap: 10 }}>
              {tests.length > 0 &&
                tests.slice(0, 3).map((t, i) => (
                  <ChoiceCard
                    key={t.id}
                    radio
                    selected={rx === 'last' && eyeTestId === t.id}
                    onSelect={() => {
                      setRx('last');
                      setEyeTestId(t.id);
                    }}
                    title={i === 0 ? 'Use last eye test' : 'Use an earlier eye test'}
                    sub={powerLine(t)}
                  />
                ))}
              <ChoiceCard radio selected={rx === 'new'} onSelect={startEyeTest} title="Do a new eye test now" sub="Opens the eye test, then comes back here with your bill kept" />
              <ChoiceCard
                radio
                selected={rx === 'none'}
                onSelect={() => {
                  setRx('none');
                  setEyeTestId(null);
                }}
                title="No power needed"
                sub="Sunglasses, accessories or frame only"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <ItemsStep
            products={productData?.products ?? []}
            cart={cart}
            onAdd={addProduct}
            onRemove={(id) => setCart((prev) => prev.filter((l) => l.product_id !== id))}
            onQty={(id, qty) => setCart((prev) => prev.map((l) => (l.product_id === id ? { ...l, qty } : l)))}
            discount={discount}
            onDiscount={setDiscount}
            cap={cap}
            totals={totals}
            taxRate={taxRate}
          />
        )}

        {step === 3 && (
          <>
            <div className={s.row} style={{ justifyContent: 'space-between', gap: 16, padding: '22px 24px', borderRadius: 24, background: 'var(--charcoal)', color: '#fff' }}>
              <span style={{ fontSize: 18 }}>Total to pay</span>
              <strong style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--orange)' }}>{inr(totals.total)}</strong>
            </div>
            <div className={s.stack} style={{ gap: 12 }}>
              <h2 className={s.h3}>How much are they paying now?</h2>
              <div role="radiogroup" aria-label="Amount" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <ChoiceCard radio selected={pay === 'full'} onSelect={() => setPay('full')} title="Full amount" sub={inr(totals.total)} />
                <ChoiceCard radio selected={pay === 'half'} onSelect={() => setPay('half')} title="Advance (half)" sub={inr(payNow(totals.total, 'half'))} />
                <ChoiceCard radio selected={pay === 'other'} onSelect={() => setPay('other')} title="Other amount" sub="Type how much" />
                <ChoiceCard radio selected={pay === 'none'} onSelect={() => setPay('none')} title="Nothing now" sub="Pays on pickup" />
              </div>
              {pay === 'other' && (
                <label className={s.field} style={{ maxWidth: 320 }}>
                  Amount paid now in ₹
                  <input className={s.input} type="number" inputMode="decimal" min={1} max={totals.total} step="0.01" value={other} onChange={(e) => setOther(e.target.value)} autoFocus />
                  {otherAmount > totals.total && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>That’s more than the bill.</span>}
                  {otherAmount > 0 && otherAmount <= totals.total && (
                    <span className={s.help} style={{ fontWeight: 500 }}>
                      {inr(totals.total - otherAmount)} left to pay on pickup
                    </span>
                  )}
                </label>
              )}
            </div>
            {pay !== 'none' && (
              <div className={s.stack} style={{ gap: 12 }}>
                <h2 className={s.h3}>Paid by</h2>
                <div role="radiogroup" aria-label="Paid by" className={s.grid} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', maxWidth: 560 }}>
                  {(['cash', 'upi', 'card'] as const).map((m) => (
                    <ChoiceCard key={m} radio selected={method === m} onSelect={() => setMethod(m)} title={m === 'upi' ? 'UPI' : m[0].toUpperCase() + m.slice(1)} />
                  ))}
                </div>
              </div>
            )}
            <label className={s.row} style={{ gap: 12, fontWeight: 700, fontSize: 17 }}>
              <input type="checkbox" checked={needsLab} onChange={(e) => setLabChoice(e.target.checked)} style={{ width: 26, height: 26 }} />
              Glasses need making at the lab
              <span className={s.muted} style={{ fontWeight: 500, fontSize: 15 }}>(shows under Orders)</span>
            </label>
            {needsLab && (
              <label className={s.field} style={{ maxWidth: 360 }}>
                Glasses ready by
                <input type="date" className={s.input} value={readyBy} min={shopDay()} onChange={(e) => setReadyBy(e.target.value)} />
                <span className={s.help} style={{ fontWeight: 500 }}>
                  {longDate(readyBy)}
                </span>
              </label>
            )}
            <label className={s.field}>
              <span>
                Note on the bill <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
              </span>
              <textarea className={s.input} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Fitting check next week" />
            </label>
            <ErrorNote>{error}</ErrorNote>
          </>
        )}
      </StepWizard>
    </>
  );
}

// ─── Step 1: customer ─────────────────────────────────────────────────────────

function CustomerStep({ selected, onSelect }: { selected: Customer | null; onSelect: (c: Customer) => void }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading } = useAdminFetch<{ customers: Customer[] }>('/api/admin/customers', {
    params: { q: debounced, status: 'active' },
  });
  const people = (data?.customers ?? []).slice(0, 6);

  return (
    <>
      <h2 className={s.h2}>Who is the customer?</h2>
      <label className={`${s.search} ${s.searchSoft}`}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Phone number or name</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type phone number or name" autoFocus />
      </label>
      <div role="radiogroup" aria-label="Customers" className={s.stack} style={{ gap: 10 }}>
        {selected && !people.some((p) => p.id === selected.id) && <PersonCard c={selected} selected onSelect={() => onSelect(selected)} />}
        {people.map((c) => (
          <PersonCard key={c.id} c={c} selected={selected?.id === c.id} onSelect={() => onSelect(c)} />
        ))}
        {!loading && debounced && people.length === 0 && <p className={s.help}>No one found for “{debounced}”. Add them as a new customer below.</p>}
      </div>
      {adding ? (
        <NewCustomerForm
          initial={q}
          onCancel={() => setAdding(false)}
          onCreated={(c: NewCustomer) => {
            setAdding(false);
            onSelect(c);
          }}
        />
      ) : (
        <button type="button" className={`${s.btn} ${s.btnDashed}`} style={{ alignSelf: 'flex-start' }} onClick={() => setAdding(true)}>
          + New customer
        </button>
      )}
    </>
  );
}

function PersonCard({ c, selected, onSelect }: { c: Customer; selected: boolean; onSelect: () => void }) {
  return (
    <ChoiceCard
      radio
      selected={selected}
      onSelect={onSelect}
      leading={
        <span aria-hidden style={{ width: 48, height: 48, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {initials(c.name)}
        </span>
      }
      title={c.name}
      sub={`${c.phone}${c.last_visit ? ` · Last visit ${shortDate(c.last_visit)}` : ''}`}
    />
  );
}

// ─── Step 3: items ────────────────────────────────────────────────────────────

interface ItemsStepProps {
  products: Product[];
  cart: CartLine[];
  onAdd: (p: Product) => void;
  onRemove: (productId: string) => void;
  onQty: (productId: string, qty: number) => void;
  discount: number;
  onDiscount: (v: number) => void;
  cap: number;
  totals: ReturnType<typeof saleTotals>;
  taxRate: number;
}

function ItemsStep({ products, cart, onAdd, onRemove, onQty, discount, onDiscount, cap, totals, taxRate }: ItemsStepProps) {
  const [shelf, setShelf] = useState<(typeof SHELVES)[number]['id']>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .filter((p) => p.status === 'active' && (shelf === 'all' || p.category === shelf))
      .filter((p) => !needle || `${p.name} ${p.brand} ${p.product_code}`.toLowerCase().includes(needle))
      .slice(0, 60);
  }, [products, shelf, q]);

  const inCart = (id: string) => cart.find((l) => l.product_id === id)?.qty ?? 0;

  return (
    <div className={s.row} style={{ alignItems: 'stretch', gap: 24 }}>
      <div className={s.stack} style={{ flex: '3 1 380px', gap: 14, minWidth: 0 }}>
        <h2 className={s.h2}>What are they buying?</h2>
        <div className={s.row} style={{ gap: 8 }} role="group" aria-label="Show">
          {SHELVES.map((sh) => (
            <button key={sh.id} type="button" className={s.chip} aria-pressed={shelf === sh.id} onClick={() => setShelf(sh.id)}>
              {sh.label}
            </button>
          ))}
        </div>
        <label className={`${s.search} ${s.searchSoft}`}>
          <Search size={20} color="#5E606A" aria-hidden />
          <span className={s.srOnly}>Search items</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, brand or code" />
        </label>
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
          {shown.map((p) => {
            const left = p.category === 'service' ? Infinity : p.stock - inCart(p.id);
            const out = left <= 0;
            return (
              <button
                key={p.id}
                type="button"
                className={s.choice}
                disabled={out}
                onClick={() => onAdd(p)}
                aria-label={`Add ${p.name}, ${inr(p.selling_price)}${out ? ', none left' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, opacity: out ? 0.5 : 1 }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
                  {CATEGORY_LABEL[p.category]} · {p.brand}
                </span>
                <strong style={{ fontSize: 16, lineHeight: 1.3 }}>{p.name}</strong>
                <span className={s.row} style={{ justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 18 }}>{inr(p.selling_price)}</strong>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{p.category === 'service' ? '' : out ? 'None left' : `${left} left`}</span>
                </span>
              </button>
            );
          })}
          {shown.length === 0 && <p className={s.help}>Nothing matches. Try another word or shelf.</p>}
        </div>
      </div>

      <aside aria-label="Bill so far" className={s.stack} style={{ flex: '2 1 280px', gap: 10, borderRadius: 24, background: 'var(--page)', padding: 20 }}>
        <strong style={{ fontSize: 17 }}>Bill so far</strong>
        {cart.length === 0 && <span style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>Tap an item to add it</span>}
        {cart.map((l) => (
          <div key={l.product_id} className={s.stack} style={{ gap: 8, padding: 12, borderRadius: 16, background: 'var(--card)' }}>
            <span className={s.row} style={{ gap: 10, flexWrap: 'nowrap' }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, minWidth: 0 }}>{l.name}</span>
              <button type="button" className={s.iconBtn} style={{ width: 40, height: 40 }} aria-label={`Remove ${l.name}`} onClick={() => onRemove(l.product_id)}>
                <X size={18} aria-hidden />
              </button>
            </span>
            <span className={s.row} style={{ gap: 10, justifyContent: 'space-between' }}>
              <Stepper label={`how many ${l.name}`} value={l.qty} min={1} max={l.category === 'service' ? 99 : Math.max(1, l.stock)} onChange={(v) => onQty(l.product_id, v)} />
              <span style={{ fontWeight: 700 }}>{inr(l.price * l.qty)}</span>
            </span>
          </div>
        ))}
        <div className={s.row} style={{ justifyContent: 'space-between', gap: 10, paddingTop: 6 }}>
          <span style={{ fontSize: 16 }}>
            Discount
            <span className={s.help} style={{ display: 'block', fontSize: 13 }}>
              Up to {cap}% for you
            </span>
          </span>
          <Stepper label="discount" value={discount} onChange={onDiscount} min={0} max={cap} format={(v) => `${v}%`} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '2px dashed #D6D3CC', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {totals.discount > 0 && (
            <span className={s.row} style={{ justifyContent: 'space-between', color: 'var(--muted)', fontSize: 15 }}>
              <span>Discount</span>
              <span>− {inr(totals.discount)}</span>
            </span>
          )}
          {taxRate > 0 && (
            <span className={s.row} style={{ justifyContent: 'space-between', color: 'var(--muted)', fontSize: 15 }}>
              <span>GST {taxRate}%</span>
              <span>{inr(totals.tax)}</span>
            </span>
          )}
          <span className={s.row} style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 16 }}>Total{taxRate > 0 ? ' (incl. GST)' : ''}</span>
            <strong style={{ fontFamily: 'var(--display)', fontSize: 30 }}>{inr(totals.total)}</strong>
          </span>
        </div>
      </aside>
    </div>
  );
}
