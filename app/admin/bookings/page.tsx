'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { longDate, shopDay, shortDate, telLink, waLink } from '@/app/lib/admin/simple';
import s from '../_ui/simple.module.css';
import { EmptyState, ErrorNote, PageHead, StatusTag } from '../_ui/parts';

interface Booking {
  id: number;
  name: string;
  phone: string;
  time: string | null;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  interest: string;
  message: string | null;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

interface BookingsData {
  day: string;
  days: { day: string; count: number }[];
  bookings: Booking[];
}

type View = 'tests' | 'all' | 'messages';

interface Appointment {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  preferred_date: string;
  preferred_time: string | null;
  test_type: string | null;
  wears_glasses: string | null;
  notes: string | null;
  status: Booking['status'];
  created_at: string;
}

const STATUS_WORDS: Record<Booking['status'], string> = { pending: 'New', confirmed: 'Confirmed', completed: 'Done', cancelled: 'Cancelled' };

// Every booking from the website or the counter, newest first, any date.
function AllBookings() {
  const [status, setStatus] = useState<'all' | Booking['status']>('all');
  const { data, loading, error, refetch } = useAdminFetch<{ appointments: Appointment[] }>('/api/admin/bookings', { params: { status } });
  const [busy, setBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const list = data?.appointments ?? [];

  const change = async (a: Appointment, next: Booking['status']) => {
    setBusy(a.id);
    setActionError('');
    try {
      await adminPut('/api/admin/bookings', { kind: 'appointment', id: a.id, status: next });
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not update the booking.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHead title="All bookings" sub="Every eye test booking from the website and the counter, newest first." />
      <div role="group" aria-label="Filter" className={s.row} style={{ gap: 8, marginBottom: 16 }}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={status === k} className={s.chip} onClick={() => setStatus(k)}>
            {k === 'all' ? 'All' : STATUS_WORDS[k]}
          </button>
        ))}
      </div>
      <ErrorNote>{error || actionError}</ErrorNote>
      <div className={s.stack} style={{ gap: 12 }}>
        {loading && !data && <EmptyState>Loading bookings…</EmptyState>}
        {data && list.length === 0 && <EmptyState>No bookings here.</EmptyState>}
        {list.map((a) => {
          const tel = telLink(a.phone);
          const wa = waLink(a.phone, `Hello ${a.name}, this is Darshana Optical about your eye test on ${shortDate(a.preferred_date)}${a.preferred_time ? ` at ${a.preferred_time}` : ''}.`);
          return (
            <div key={a.id} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className={s.row} style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{a.name}</div>
                  <div className={s.sub} style={{ margin: 0, overflowWrap: 'anywhere' }}>
                    {a.phone}{a.email ? ` · ${a.email}` : ''}
                  </div>
                </div>
                {a.status === 'pending' ? <StatusTag tone="orange">New</StatusTag> : a.status === 'cancelled' ? <StatusTag>Cancelled</StatusTag> : <StatusTag tone="good">{STATUS_WORDS[a.status]}</StatusTag>}
              </div>
              <div style={{ fontWeight: 600 }}>
                {shortDate(a.preferred_date)}{a.preferred_time ? ` at ${a.preferred_time}` : ''} · {a.test_type || 'Eye test'}
                {a.wears_glasses ? ` · wears glasses: ${a.wears_glasses}` : ''}
              </div>
              {a.notes && <div className={s.sub} style={{ margin: 0, overflowWrap: 'anywhere' }}>“{a.notes}”</div>}
              <div className={s.sub} style={{ margin: 0, fontSize: 13 }}>Booked {shortDate(a.created_at)}</div>
              <div className={s.row} style={{ gap: 8, flexWrap: 'wrap' }}>
                {wa && <a href={wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`}><MessageCircle width={18} height={18} /> WhatsApp</a>}
                {tel && <a href={tel} className={`${s.btn} ${s.btnSoft}`}><Phone width={18} height={18} /> Call</a>}
                {a.status === 'pending' && <button type="button" className={`${s.btn} ${s.btnSoft}`} disabled={busy === a.id} onClick={() => change(a, 'confirmed')}>Mark confirmed</button>}
                {(a.status === 'pending' || a.status === 'confirmed') && <button type="button" className={`${s.btn} ${s.btnSoft}`} disabled={busy === a.id} onClick={() => change(a, 'cancelled')}>Cancel</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const DAY_NAMES = ['Today', 'Tomorrow'];

export default function BookingsPage() {
  return (
    <Suspense>
      <Bookings />
    </Suspense>
  );
}

function Bookings() {
  const router = useRouter();
  const param = useSearchParams().get('view');
  const view: View = param === 'messages' || param === 'all' ? param : 'tests';
  const { data: msgData } = useAdminFetch<{ inquiries: Inquiry[] }>('/api/admin/bookings');
  const newMessages = (msgData?.inquiries ?? []).filter((m) => m.status === 'new').length;
  const go = (v: View) => router.replace(v === 'tests' ? '/admin/bookings' : `/admin/bookings?view=${v}`, { scroll: false });

  return (
    <>
      <div role="tablist" aria-label="Show" className={s.row} style={{ gap: 8 }}>
        <button type="button" role="tab" aria-selected={view === 'tests'} className={s.chip} onClick={() => go('tests')}>
          Eye test bookings
        </button>
        <button type="button" role="tab" aria-selected={view === 'all'} className={s.chip} onClick={() => go('all')}>
          All bookings
        </button>
        <button type="button" role="tab" aria-selected={view === 'messages'} className={s.chip} onClick={() => go('messages')}>
          Website messages{newMessages > 0 ? ` (${newMessages} new)` : ''}
        </button>
      </div>
      {view === 'tests' ? <EyeTestBookings /> : view === 'all' ? <AllBookings /> : <Messages />}
    </>
  );
}

function EyeTestBookings() {
  const router = useRouter();
  const [day, setDay] = useState(() => shopDay());
  const { data, loading, error, refetch } = useAdminFetch<BookingsData>('/api/admin/simple/bookings', { params: { day } });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  const cancel = async (b: Booking) => {
    setBusy(b.id);
    setActionError('');
    try {
      await adminPut('/api/admin/bookings', { kind: 'appointment', id: b.id, status: 'cancelled' });
      setCancelling(null);
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not cancel the booking.');
    } finally {
      setBusy(null);
    }
  };

  const arrived = async (b: Booking) => {
    setBusy(b.id);
    setActionError('');
    try {
      if (b.status === 'pending') await adminPut('/api/admin/bookings', { kind: 'appointment', id: b.id, status: 'confirmed' });
      router.push(`/admin/eye-test?booking=${b.id}`);
    } catch (err: any) {
      setActionError(err.message ?? 'Could not update the booking.');
      setBusy(null);
    }
  };

  const days = data?.days ?? [0, 1, 2].map((i) => ({ day: shopDay(i), count: 0 }));

  return (
    <>
      <PageHead title="Bookings" sub={longDate(day)}>
        <button type="button" className={`${s.btn} ${s.btnDark}`} aria-expanded={adding} onClick={() => setAdding((v) => !v)}>
          + Add booking
        </button>
      </PageHead>

      <div role="tablist" aria-label="Day" className={s.row} style={{ gap: 10 }}>
        {days.map((d, i) => (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={day === d.day}
            onClick={() => setDay(d.day)}
            className={s.btn}
            style={day === d.day ? { background: 'var(--charcoal)', color: '#fff' } : { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' }}
          >
            {DAY_NAMES[i] ?? longDate(d.day).split(',')[0]} ({d.count})
          </button>
        ))}
      </div>

      {adding && (
        <AddBooking
          day={day}
          onSaved={() => {
            setAdding(false);
            void refetch();
          }}
        />
      )}

      {cancelling && (
        <div className={`${s.card} ${s.up}`} role="alertdialog" aria-labelledby="cancel-title" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--soft-orange)' }}>
          <h2 id="cancel-title" className={s.h3} style={{ fontSize: 20 }}>
            Cancel {cancelling.name}’s {cancelling.time ?? ''} booking?
          </h2>
          <div className={s.row} style={{ gap: 10 }}>
            <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={busy === cancelling.id} onClick={() => cancel(cancelling)}>
              {busy === cancelling.id ? 'Cancelling…' : 'Yes, cancel it'}
            </button>
            <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => setCancelling(null)}>
              No, keep it
            </button>
          </div>
        </div>
      )}

      <ErrorNote>{error || actionError}</ErrorNote>

      <div className={s.stack} style={{ gap: 12 }}>
        {loading && !data && <EmptyState>Loading bookings…</EmptyState>}
        {data && data.bookings.length === 0 && <EmptyState>No eye tests booked for this day.</EmptyState>}
        {data?.bookings.map((b) => {
          const tel = telLink(b.phone);
          const done = b.status === 'completed';
          return (
            <div key={b.id} className={`${s.attention} ${s.up}`} style={{ padding: '16px 18px', gap: 16 }}>
              <span
                style={{
                  width: 104,
                  flex: 'none',
                  padding: '12px 0',
                  borderRadius: 18,
                  textAlign: 'center',
                  fontFamily: 'var(--display)',
                  fontSize: 19,
                  fontWeight: 700,
                  ...(done ? { background: 'var(--page)', color: 'var(--muted)' } : { background: 'var(--soft-orange)', color: 'var(--orange-deep)' }),
                }}
              >
                {b.time ?? 'Any time'}
              </span>
              <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 19 }}>{b.name}</strong>
                <span className={s.muted} style={{ fontSize: 15 }}>
                  {b.type} · {b.phone}
                </span>
              </span>
              {done ? (
                <StatusTag tone="good">Done</StatusTag>
              ) : (
                <span className={s.row} style={{ gap: 8 }}>
                  {b.status === 'confirmed' && <StatusTag tone="orange">Here now</StatusTag>}
                  {tel && (
                    <a href={tel} className={`${s.btn} ${s.btnSoft}`} aria-label={`Call ${b.name}`}>
                      Call
                    </a>
                  )}
                  <button type="button" className={`${s.btn} ${s.btnSoft}`} aria-label={`Cancel ${b.name}’s booking`} onClick={() => setCancelling(b)}>
                    Cancel
                  </button>
                  <button type="button" className={`${s.btn} ${s.btnPrimary}`} disabled={busy === b.id} onClick={() => arrived(b)}>
                    {busy === b.id ? 'Opening…' : b.status === 'confirmed' ? 'Start test' : 'Arrived · Start test'}
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className={s.help}>Bookings made on your website appear here automatically.</p>
    </>
  );
}

/** "17:05" → "05:05 PM", the format the bookings API and website use. */
function to12h(value: string): string {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return '';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function AddBooking({ day, onSaved }: { day: string; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('17:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminPost('/api/admin/simple/bookings', { name: name.trim(), phone: phone.trim(), day, time: to12h(time) });
      onSaved();
    } catch (err: any) {
      const msg = String(err.message ?? '');
      setError(/phone/.test(msg) ? 'Enter a 10-digit mobile number.' : /name/.test(msg) ? 'Enter the customer’s name.' : /time/.test(msg) ? 'Pick a time.' : msg);
    } finally {
      setBusy(false);
    }
  };

  const field = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 16, fontWeight: 700 } as const;
  return (
    <form onSubmit={submit} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-label={`New booking for ${longDate(day)}`}>
      <div className={s.row} style={{ gap: 12, alignItems: 'flex-end' }}>
        <label style={{ ...field, flex: '1 1 200px' }}>
          Name
          <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={255} autoFocus />
        </label>
        <label style={{ ...field, flex: '1 1 200px' }}>
          Phone
          <input className={s.input} type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91" />
        </label>
        <label style={{ ...field, flex: '0 1 170px' }}>
          Time
          <input className={s.input} type="time" value={time} min="09:00" max="21:00" step={300} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <button type="submit" className={`${s.btn} ${s.btnPrimary}`} style={{ minHeight: 60 }} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </form>
  );
}

function Messages() {
  const { data, loading, error, refetch } = useAdminFetch<{ inquiries: Inquiry[] }>('/api/admin/bookings');
  const [showClosed, setShowClosed] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const all = data?.inquiries ?? [];
  const list = all.filter((m) => showClosed || m.status !== 'closed');

  const setStatus = async (m: Inquiry, status: Inquiry['status']) => {
    setBusy(m.id);
    setActionError('');
    try {
      await adminPut('/api/admin/bookings', { kind: 'inquiry', id: m.id, status });
      await refetch();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not update the message.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHead title="Website messages" sub="Sent from the Contact page on your website." />
      <ErrorNote>{error || actionError}</ErrorNote>
      <div className={s.stack} style={{ gap: 12 }}>
        {loading && !data && <EmptyState>Loading messages…</EmptyState>}
        {data && list.length === 0 && <EmptyState>No messages waiting.</EmptyState>}
        {list.map((m) => {
          const tel = telLink(m.phone);
          const wa = waLink(m.phone, `Hello ${m.name}, thank you for contacting Darshana Optical about ${m.interest.toLowerCase()}.`);
          return (
            <div key={m.id} className={`${s.card} ${s.up}`} style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: m.status === 'closed' ? 0.6 : 1 }}>
              <div className={s.row} style={{ justifyContent: 'space-between', gap: 10 }}>
                <span>
                  <strong style={{ fontSize: 19 }}>{m.name}</strong>
                  <span className={s.muted} style={{ display: 'block', fontSize: 15 }}>
                    {m.interest} · {m.phone}
                    {m.email ? ` · ${m.email}` : ''} · {shortDate(m.created_at)}
                  </span>
                </span>
                {m.status === 'new' ? <StatusTag tone="orange">New</StatusTag> : m.status === 'contacted' ? <StatusTag tone="good">Replied</StatusTag> : <StatusTag>Closed</StatusTag>}
              </div>
              {m.message && <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{m.message}</p>}
              <div className={s.row} style={{ gap: 10 }}>
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGreen}`} onClick={() => m.status === 'new' && void setStatus(m, 'contacted')}>
                    <MessageCircle size={18} aria-hidden /> Reply on WhatsApp
                  </a>
                )}
                {tel && (
                  <a href={tel} className={`${s.btn} ${s.btnLight}`} aria-label={`Call ${m.name}`}>
                    <Phone size={18} aria-hidden /> Call
                  </a>
                )}
                {m.status === 'new' && (
                  <button type="button" className={`${s.btn} ${s.btnSoft}`} disabled={busy === m.id} onClick={() => setStatus(m, 'contacted')}>
                    Mark replied
                  </button>
                )}
                {m.status !== 'closed' ? (
                  <button type="button" className={`${s.btn} ${s.btnSoft}`} disabled={busy === m.id} onClick={() => setStatus(m, 'closed')}>
                    Close
                  </button>
                ) : (
                  <button type="button" className={`${s.btn} ${s.btnSoft}`} disabled={busy === m.id} onClick={() => setStatus(m, 'new')}>
                    Open again
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {all.some((m) => m.status === 'closed') && (
          <button type="button" className={`${s.btn} ${s.btnLight}`} style={{ alignSelf: 'flex-start' }} onClick={() => setShowClosed((v) => !v)}>
            {showClosed ? 'Hide closed messages' : 'Show closed messages'}
          </button>
        )}
      </div>
    </>
  );
}
