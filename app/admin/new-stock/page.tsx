'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { canManageStock, inr, money } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import StepWizard from '../_ui/StepWizard';
import { ChoiceCard, DoneScreen, EmptyState, ErrorNote, PageHead, Stepper } from '../_ui/parts';
import ItemForm from '../_ui/ItemForm';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  balance: string;
  status: string;
}

interface Product {
  id: string;
  product_code: string;
  name: string;
  brand: string;
  category: string;
  purchase_price: string;
  stock: number;
  status: string;
}

interface Line {
  product_id: string;
  name: string;
  qty: number;
  cost: string;
}

type Paid = 'full' | 'some' | 'none';
const STEPS = ['Who sent it?', 'What came in?', 'Did you pay them?'] as const;

export default function NewStockPage() {
  const { role } = useAuth();
  if (!canManageStock(role)) {
    return (
      <>
        <PageHead title="New stock arrived" />
        <EmptyState>Only the owner or a manager can add new stock. Ask them to do it.</EmptyState>
      </>
    );
  }
  return <NewStock />;
}

function NewStock() {
  const { data: supplierData, refetch: refetchSuppliers } = useAdminFetch<{ suppliers: Supplier[] }>('/api/admin/suppliers');
  const { data: productData } = useAdminFetch<{ products: Product[] }>('/api/admin/products', { params: { status: 'active' } });

  const [step, setStep] = useState(0);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [paid, setPaid] = useState<Paid | null>(null);
  const [some, setSome] = useState('');
  const [billNo, setBillNo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ number: string; total: number; owe: number } | null>(null);

  const total = money(lines.reduce((sum, l) => sum + (Number(l.cost) || 0) * l.qty, 0));
  const paidNow = paid === 'full' ? total : paid === 'some' ? money(Number(some) || 0) : 0;
  const linesOk = lines.length > 0 && lines.every((l) => l.qty > 0 && l.cost !== '' && Number(l.cost) >= 0);
  const valid = step === 0 ? !!supplier : step === 1 ? linesOk : !!paid && (paid !== 'some' || (paidNow > 0 && paidNow <= total));

  const save = async () => {
    if (!supplier) return;
    setBusy(true);
    setError('');
    try {
      const res = await adminPost<{ purchase_number: string }>('/api/admin/purchases', {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_bill_number: billNo.trim() || null,
        items: lines.map((l) => ({ product_id: l.product_id, quantity: l.qty, purchase_price: Number(l.cost) })),
        amount_paid: paidNow,
      });
      setDone({ number: res.purchase_number, total, owe: money(total - paidNow) });
    } catch (err: any) {
      setError(err.message ?? 'The stock could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  if (done && supplier) {
    return (
      <>
        <PageHead title="New stock arrived" />
        <section className={s.card}>
          <DoneScreen
            title="Stock added"
            detail={`${done.number} · ${supplier.name} · ${inr(done.total)}. ${done.owe > 0 ? `You owe them ${inr(done.owe)}.` : 'Paid in full.'}`}
          >
            <Link href="/admin/stock" className={`${s.btn} ${s.btnBig} ${s.btnDark}`}>
              See stock
            </Link>
            <button
              type="button"
              className={`${s.btn} ${s.btnBig} ${s.btnSoft}`}
              onClick={() => {
                setDone(null);
                setStep(0);
                setSupplier(null);
                setLines([]);
                setPaid(null);
                setSome('');
                setBillNo('');
              }}
            >
              Add more stock
            </button>
          </DoneScreen>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title="New stock arrived">
        <Link href="/admin/stock" style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '12px 0' }}>
          Cancel
        </Link>
      </PageHead>

      <StepWizard steps={STEPS} current={step} canNext={valid} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => (step === 2 ? void save() : setStep(step + 1))} finishLabel="Save stock" busy={busy}>
        {step === 0 && (
          <>
            <h2 className={s.h2}>Who sent it?</h2>
            <div role="radiogroup" aria-label="Supplier" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 10 }}>
              {(supplierData?.suppliers ?? [])
                .filter((sp) => sp.status !== 'inactive')
                .map((sp) => (
                  <ChoiceCard
                    key={sp.id}
                    radio
                    selected={supplier?.id === sp.id}
                    onSelect={() => setSupplier(sp)}
                    title={sp.name}
                    sub={Number(sp.balance) > 0 ? `You owe ${inr(sp.balance)}` : sp.phone}
                  />
                ))}
            </div>
            {addingSupplier ? (
              <NewSupplier
                onCancel={() => setAddingSupplier(false)}
                onCreated={(sp) => {
                  setAddingSupplier(false);
                  setSupplier(sp);
                  void refetchSuppliers();
                }}
              />
            ) : (
              <button type="button" className={`${s.btn} ${s.btnDashed}`} style={{ alignSelf: 'flex-start' }} onClick={() => setAddingSupplier(true)}>
                + New supplier
              </button>
            )}
          </>
        )}

        {step === 1 && <Lines products={productData?.products ?? []} lines={lines} setLines={setLines} total={total} />}

        {step === 2 && (
          <>
            <div className={s.row} style={{ justifyContent: 'space-between', gap: 16, padding: '22px 24px', borderRadius: 24, background: 'var(--charcoal)', color: '#fff' }}>
              <span style={{ fontSize: 18 }}>Bill from {supplier?.name}</span>
              <strong style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--orange)' }}>{inr(total)}</strong>
            </div>
            <h2 className={s.h3}>Did you pay them?</h2>
            <div role="radiogroup" aria-label="Paid" className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))' }}>
              <ChoiceCard radio selected={paid === 'full'} onSelect={() => setPaid('full')} title="Yes, paid in full" sub={inr(total)} />
              <ChoiceCard radio selected={paid === 'some'} onSelect={() => setPaid('some')} title="Paid some" sub="Type the amount" />
              <ChoiceCard radio selected={paid === 'none'} onSelect={() => setPaid('none')} title="Not yet" sub="Added to what you owe them" />
            </div>
            {paid === 'some' && (
              <label className={s.field} style={{ maxWidth: 320 }}>
                Amount paid in ₹
                <input className={s.input} type="number" inputMode="decimal" min={1} max={total} step="0.01" value={some} onChange={(e) => setSome(e.target.value)} autoFocus />
                {paidNow > total && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>That’s more than the bill.</span>}
              </label>
            )}
            <label className={s.field} style={{ maxWidth: 420 }}>
              <span>
                Their bill number <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
              </span>
              <input className={s.input} value={billNo} maxLength={100} onChange={(e) => setBillNo(e.target.value)} />
            </label>
            <ErrorNote>{error}</ErrorNote>
          </>
        )}
      </StepWizard>
    </>
  );
}

function Lines({ products, lines, setLines, total }: { products: Product[]; lines: Line[]; setLines: (fn: (prev: Line[]) => Line[]) => void; total: number }) {
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const needle = q.trim().toLowerCase();
  const matches = useMemo(
    () =>
      needle
        ? products.filter((p) => p.category !== 'service' && !lines.some((l) => l.product_id === p.id) && `${p.name} ${p.brand} ${p.product_code}`.toLowerCase().includes(needle)).slice(0, 8)
        : [],
    [products, lines, needle],
  );

  return (
    <>
      <h2 className={s.h2}>What came in?</h2>
      <label className={`${s.search} ${s.searchSoft}`}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Find an item to add</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type an item name, brand or code to add it" autoFocus />
      </label>
      {matches.length > 0 && (
        <div className={s.row} style={{ gap: 8 }}>
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              className={s.chip}
              onClick={() => {
                setLines((prev) => [...prev, { product_id: p.id, name: p.name, qty: 1, cost: String(Number(p.purchase_price) || '') }]);
                setQ('');
              }}
            >
              + {p.name}
            </button>
          ))}
        </div>
      )}
      {needle && matches.length === 0 && !creating && (
        <div className={s.row} style={{ gap: 12 }}>
          <span className={s.help}>Nothing matches “{q.trim()}”.</span>
          <button type="button" className={`${s.btn} ${s.btnDashed}`} onClick={() => setCreating(true)}>
            + Add it as a new item
          </button>
        </div>
      )}
      {creating && (
        <ItemForm
          noOpeningStock
          initialName={q.trim()}
          onCancel={() => setCreating(false)}
          onSaved={(p) => {
            // Starts at zero stock: this delivery adds the quantity.
            setLines((prev) => [...prev, { product_id: p.id, name: p.name, qty: 1, cost: String(Number(p.purchase_price) || '') }]);
            setCreating(false);
            setQ('');
          }}
        />
      )}

      <div className={s.stack} style={{ gap: 10 }}>
        {lines.length === 0 && <EmptyState>Search above and tap an item to add it.</EmptyState>}
        {lines.map((l) => (
          <div key={l.product_id} className={s.row} style={{ gap: 12, padding: '12px 14px', borderRadius: 20, background: 'var(--page)' }}>
            <strong style={{ flex: '1 1 200px', fontSize: 17 }}>{l.name}</strong>
            <Stepper label={`quantity of ${l.name}`} value={l.qty} min={1} max={10000} onChange={(v) => setLines((prev) => prev.map((x) => (x.product_id === l.product_id ? { ...x, qty: v } : x)))} />
            <label className={s.row} style={{ gap: 8, fontSize: 15, fontWeight: 700 }}>
              Cost each ₹
              <input
                className={`${s.input} ${s.inputOnPage}`}
                style={{ width: 130, minHeight: 52 }}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={l.cost}
                onChange={(e) => setLines((prev) => prev.map((x) => (x.product_id === l.product_id ? { ...x, cost: e.target.value } : x)))}
              />
            </label>
            <button type="button" className={s.iconBtn} style={{ background: 'var(--card)' }} aria-label={`Remove ${l.name}`} onClick={() => setLines((prev) => prev.filter((x) => x.product_id !== l.product_id))}>
              <X size={18} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <div className={s.row} style={{ justifyContent: 'space-between', paddingTop: 12, borderTop: '2px dashed #D6D3CC' }}>
        <span style={{ fontSize: 17 }}>Bill total</span>
        <strong style={{ fontFamily: 'var(--display)', fontSize: 30 }}>{inr(total)}</strong>
      </div>
    </>
  );
}

function NewSupplier({ onCreated, onCancel }: { onCreated: (s: Supplier) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await adminPost<{ supplier: Supplier }>('/api/admin/suppliers', { name: name.trim(), phone: phone.trim() });
      onCreated(res.supplier);
    } catch (err: any) {
      setError(err.message ?? 'The supplier could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.stack} style={{ gap: 14, padding: 20, borderRadius: 22, background: 'var(--page)' }}>
      <strong style={{ fontSize: 18 }}>New supplier</strong>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
        <label className={s.field}>
          Name
          <input className={`${s.input} ${s.inputOnPage}`} value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
        </label>
        <label className={s.field}>
          Phone
          <input className={`${s.input} ${s.inputOnPage}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} />
        </label>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnDark}`} disabled={busy}>
          {busy ? 'Saving…' : 'Save supplier'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
