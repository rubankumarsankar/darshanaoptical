'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { initials, longDate, opticalProblem, OPTICS, shopDay, shortDate, type OpticalField } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import StepWizard from '../_ui/StepWizard';
import { ChoiceCard, DoneScreen, EmptyState, ErrorNote, PageHead, StatusTag, WhatsAppButton } from '../_ui/parts';

interface Customer {
  id: string;
  name: string;
  phone: string;
  last_visit?: string | null;
}

interface Booking {
  id: number;
  name: string;
  phone: string;
  time: string | null;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

type Side = Record<OpticalField | 'va', string>;
const EMPTY_SIDE: Side = { sph: '', cyl: '', axis: '', add: '', pd: '', va: '' };
const FIELDS: { key: OpticalField | 'va'; label: string; hint: string }[] = [
  { key: 'sph', label: 'Power (SPH)', hint: '±20' },
  { key: 'cyl', label: 'Cylinder (CYL)', hint: '±20' },
  { key: 'axis', label: 'Axis (0–180)', hint: '0–180' },
  { key: 'add', label: 'Reading add (ADD)', hint: '0–4' },
  { key: 'pd', label: 'PD (mm)', hint: '20–45' },
  { key: 'va', label: 'Vision (VA)', hint: '6/6' },
];
const SUGGESTIONS = [
  { id: 'single_vision', label: 'Single vision' },
  { id: 'progressive', label: 'Progressive' },
  { id: 'bifocal', label: 'Bifocal' },
  { id: 'contact_lenses', label: 'Contact lenses' },
  { id: 'no_change', label: 'No change' },
] as const;
const STEPS = ['Customer', 'Eye power', 'Suggestion'] as const;

const digits = (p: string) => p.replace(/\D/g, '').slice(-10);

function sideProblems(side: Side): Partial<Record<OpticalField, string>> {
  const out: Partial<Record<OpticalField, string>> = {};
  for (const f of Object.keys(OPTICS) as OpticalField[]) {
    const p = opticalProblem(f, side[f]);
    if (p) out[f] = p;
  }
  if (!out.cyl && side.cyl.trim() && Number(side.cyl) !== 0 && !side.axis.trim()) out.axis = 'Axis is needed when there is a cylinder';
  return out;
}

const fmtPower = (v: string) => {
  const n = Number(v);
  if (!v.trim() || !Number.isFinite(n)) return '—';
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`;
};

export default function EyeTestPage() {
  return (
    <Suspense>
      <EyeTest />
    </Suspense>
  );
}

function EyeTest() {
  const params = useSearchParams();
  const fromSale = params.get('from') === 'sale';
  const { data: bookingData } = useAdminFetch<{ bookings: Booking[] }>('/api/admin/simple/bookings');

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [right, setRight] = useState<Side>(EMPTY_SIDE);
  const [left, setLeft] = useState<Side>(EMPTY_SIDE);
  const [suggestion, setSuggestion] = useState<(typeof SUGGESTIONS)[number]['id'] | null>(null);
  const [note, setNote] = useState('');
  const [nextCheck, setNextCheck] = useState(() => shopDay(365));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  // ?customer=… (from New sale or Customers) skips straight to the powers.
  useEffect(() => {
    const ref = params.get('customer');
    if (!ref) return;
    let cancelled = false;
    fetch(`/api/admin/customers/${encodeURIComponent(ref)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.customer) return;
        setCustomer(json.customer);
        setStep(1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [params]);

  /** A booking isn't a customer yet: match them by phone, or add them. */
  const chooseBooking = async (b: Booking) => {
    setError('');
    setBookingId(b.id);
    setCustomer(null);
    try {
      const phone = digits(b.phone);
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(phone)}`);
      const found: Customer[] = res.ok ? (await res.json()).customers : [];
      const match = found.find((c) => digits(c.phone) === phone);
      if (match) {
        setCustomer(match);
        return;
      }
      const created = await adminPost<{ customer: Customer }>('/api/admin/customers', { name: b.name.trim(), phone });
      setCustomer(created.customer);
    } catch (err: any) {
      setBookingId(null);
      setError(`Couldn’t add ${b.name} as a customer: ${err.message ?? 'please add them from Customers first.'}`);
    }
  };

  // Arriving from Home's "Start test" (?booking=7): pick that booking once it loads.
  const wantedBooking = Number(params.get('booking')) || null;
  const wanted = wantedBooking ? bookingData?.bookings.find((b) => b.id === wantedBooking) : undefined;
  const autoPicked = useRef(false);
  useEffect(() => {
    if (!wanted || autoPicked.current) return;
    autoPicked.current = true;
    // Deferred a tick so the lookup's state updates happen outside the effect body.
    const t = setTimeout(() => void chooseBooking(wanted), 0);
    return () => {
      clearTimeout(t);
      autoPicked.current = false;
    };
  }, [wanted]);

  const rightProblems = sideProblems(right);
  const leftProblems = sideProblems(left);
  const anyValue = [...Object.values(right), ...Object.values(left)].some((v) => v.trim());
  const valid = step === 0 ? !!customer : step === 1 ? anyValue && Object.keys(rightProblems).length === 0 && Object.keys(leftProblems).length === 0 : !!suggestion;

  const save = async () => {
    if (!customer) return;
    setBusy(true);
    setError('');
    const side = (x: Side) => ({ sph: x.sph, cyl: x.cyl, axis: x.axis, add: x.add, pd: x.pd, va: x.va });
    try {
      const res = await adminPost<{ eyeTest: { id: string } }>('/api/admin/simple/eye-tests', {
        customer_id: customer.id,
        booking_id: bookingId,
        right: side(right),
        left: side(left),
        recommendation: suggestion,
        note: note.trim() || null,
        next_checkup: nextCheck || null,
      });
      setSavedId(res.eyeTest.id);
    } catch (err: any) {
      setError(err.message ?? 'The eye test could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  if (savedId && customer) {
    const line = (label: string, x: Side) =>
      `${label}: SPH ${fmtPower(x.sph)}${x.cyl ? `, CYL ${fmtPower(x.cyl)}` : ''}${x.axis ? `, Axis ${x.axis}` : ''}${x.add ? `, ADD ${fmtPower(x.add)}` : ''}`;
    const text = [
      `Hello ${customer.name}, here is your eye test from Darshana Optical (${shortDate(shopDay())}).`,
      line('Right eye', right),
      line('Left eye', left),
      suggestion ? `We suggest: ${SUGGESTIONS.find((x) => x.id === suggestion)!.label}.` : '',
      nextCheck ? `Next check-up: ${longDate(nextCheck)}.` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const saleHref = `/admin/sale?customer=${encodeURIComponent(customer.id)}&eyeTest=${encodeURIComponent(savedId)}${fromSale ? '&resume=1' : ''}`;
    return (
      <>
        <PageHead title="Eye test" />
        <section className={s.card}>
          <DoneScreen title="Eye test saved" detail={`${customer.name} · Right ${fmtPower(right.sph)} · Left ${fmtPower(left.sph)}`}>
            <Link href={saleHref} className={`${s.btn} ${s.btnBig} ${s.btnPrimary}`}>
              {fromSale ? 'Back to the sale' : 'Start sale with this power'}
            </Link>
            <WhatsAppButton phone={customer.phone} text={text} className={`${s.btn} ${s.btnBig} ${s.btnGreen}`}>
              Send on WhatsApp
            </WhatsAppButton>
            <Link href={`/admin/prescriptions/${encodeURIComponent(savedId)}?print=1`} className={`${s.btn} ${s.btnBig} ${s.btnDark}`}>
              Print prescription
            </Link>
            <Link href="/admin" className={`${s.btn} ${s.btnBig} ${s.btnSoft}`}>
              Done
            </Link>
          </DoneScreen>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title="Eye test">
        <Link href={fromSale ? '/admin/sale' : '/admin'} style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '12px 0' }}>
          Cancel
        </Link>
      </PageHead>

      <StepWizard
        steps={STEPS}
        current={step}
        canNext={valid}
        onBack={() => setStep(Math.max(0, step - 1))}
        onNext={() => (step === STEPS.length - 1 ? void save() : setStep(step + 1))}
        finishLabel="Save eye test"
        busy={busy}
      >
        {step === 0 && (
          <PickCustomer
            bookings={(bookingData?.bookings ?? []).filter((b) => b.status !== 'completed')}
            customer={customer}
            bookingId={bookingId}
            onBooking={chooseBooking}
            onCustomer={(c) => {
              setBookingId(null);
              setCustomer(c);
            }}
            error={error}
          />
        )}

        {step === 1 && customer && (
          <>
            <h2 className={s.h2}>{customer.name}’s eye power</h2>
            <p className={s.help}>Leave a box empty if it isn’t needed. Use minus for short sight, e.g. −1.75.</p>
            <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
              <EyeCard title="Right eye" side={right} problems={rightProblems} onChange={setRight} />
              <EyeCard title="Left eye" side={left} problems={leftProblems} onChange={setLeft} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={s.h2}>What do you suggest?</h2>
            <div role="radiogroup" aria-label="Suggestion" className={s.row} style={{ gap: 10 }}>
              {SUGGESTIONS.map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={suggestion === x.id} className={s.choice} style={{ minHeight: 60 }} onClick={() => setSuggestion(x.id)}>
                  <span className={s.choiceTitle}>{x.label}</span>
                </button>
              ))}
            </div>
            <label className={s.field}>
              <span>
                Note <span className={s.muted} style={{ fontWeight: 500 }}>(optional)</span>
              </span>
              <textarea className={s.input} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="Anything the next person should know" />
            </label>
            <label className={s.field} style={{ maxWidth: 360 }}>
              Next check-up
              <input type="date" className={s.input} value={nextCheck} min={shopDay()} onChange={(e) => setNextCheck(e.target.value)} />
              <span className={s.help} style={{ fontWeight: 500 }}>
                {longDate(nextCheck)}
              </span>
            </label>
            <ErrorNote>{error}</ErrorNote>
          </>
        )}
      </StepWizard>
    </>
  );
}

function PickCustomer({
  bookings,
  customer,
  bookingId,
  onBooking,
  onCustomer,
  error,
}: {
  bookings: Booking[];
  customer: Customer | null;
  bookingId: number | null;
  onBooking: (b: Booking) => void;
  onCustomer: (c: Customer) => void;
  error: string;
}) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data } = useAdminFetch<{ customers: Customer[] }>('/api/admin/customers', { params: { q: debounced, status: 'active' }, skip: !debounced });
  const found = debounced ? (data?.customers ?? []).slice(0, 6) : [];

  return (
    <>
      <h2 className={s.h2}>Who is having the test?</h2>
      {bookings.length > 0 && (
        <div className={s.stack} style={{ gap: 10 }}>
          <h3 className={s.h3}>Booked for today</h3>
          <div role="radiogroup" aria-label="Today’s bookings" className={s.stack} style={{ gap: 10 }}>
            {bookings.map((b) => (
              <ChoiceCard
                key={b.id}
                radio
                selected={bookingId === b.id}
                onSelect={() => onBooking(b)}
                title={b.name}
                sub={`${b.time ?? 'Any time'} · ${b.phone}`}
                trailing={b.status === 'confirmed' ? <StatusTag tone="orange">Here now</StatusTag> : undefined}
              />
            ))}
          </div>
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>
      <h3 className={s.h3}>{bookings.length > 0 ? 'Or find a customer' : 'Find a customer'}</h3>
      <label className={`${s.search} ${s.searchSoft}`}>
        <Search size={22} color="#5E606A" aria-hidden />
        <span className={s.srOnly}>Phone number or name</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type phone number or name" />
      </label>
      <div role="radiogroup" aria-label="Customers" className={s.stack} style={{ gap: 10 }}>
        {customer && !bookingId && !found.some((c) => c.id === customer.id) && <ChoiceCard radio selected onSelect={() => {}} title={customer.name} sub={customer.phone} />}
        {found.map((c) => (
          <ChoiceCard
            key={c.id}
            radio
            selected={customer?.id === c.id && !bookingId}
            onSelect={() => onCustomer(c)}
            leading={
              <span aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', background: 'var(--soft-orange)', color: 'var(--orange-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials(c.name)}
              </span>
            }
            title={c.name}
            sub={`${c.phone}${c.last_visit ? ` · Last visit ${shortDate(c.last_visit)}` : ''}`}
          />
        ))}
        {debounced && found.length === 0 && <EmptyState>No one found. Add them from Customers or New sale first.</EmptyState>}
      </div>
      {customer && bookingId && (
        <p className={s.help} role="status">
          Selected: <strong style={{ color: 'var(--ink)' }}>{customer.name}</strong> ({customer.phone})
        </p>
      )}
    </>
  );
}

function EyeCard({ title, side, problems, onChange }: { title: string; side: Side; problems: Partial<Record<OpticalField, string>>; onChange: (s: Side) => void }) {
  return (
    <fieldset className={s.stack} style={{ gap: 14, margin: 0, border: 0, padding: 20, borderRadius: 24, background: 'var(--page)' }}>
      <legend className={s.h3} style={{ fontSize: 22, fontFamily: 'var(--display)', padding: 0, marginBottom: 14, float: 'left', width: '100%' }}>
        {title}
      </legend>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, clear: 'both' }}>
        {FIELDS.map((f) => {
          const problem = f.key === 'va' ? undefined : problems[f.key];
          const id = `${title}-${f.key}`.replace(/\s/g, '-').toLowerCase();
          return (
            <label key={f.key} className={s.field} style={{ fontSize: 15 }}>
              {f.label}
              <input
                id={id}
                className={`${s.input} ${s.inputOnPage}`}
                style={{ fontSize: 22, fontWeight: 700, borderColor: problem ? 'var(--danger)' : undefined }}
                type={f.key === 'va' ? 'text' : 'number'}
                inputMode={f.key === 'va' ? 'text' : 'decimal'}
                step={f.key === 'va' ? undefined : OPTICS[f.key].step}
                min={f.key === 'va' ? undefined : OPTICS[f.key].min}
                max={f.key === 'va' ? undefined : OPTICS[f.key].max}
                maxLength={f.key === 'va' ? 20 : undefined}
                value={side[f.key]}
                onChange={(e) => onChange({ ...side, [f.key]: e.target.value })}
                placeholder={f.hint}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? `${id}-err` : undefined}
              />
              {problem && (
                <span id={`${id}-err`} style={{ color: 'var(--danger)', fontSize: 14, fontWeight: 600 }}>
                  {problem}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
