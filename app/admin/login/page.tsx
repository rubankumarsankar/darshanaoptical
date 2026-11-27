'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { initials, roleLabel } from '@/app/lib/admin/simple';
import { forget, readRemembered, remember, type RememberedUser } from '@/app/lib/admin/remembered-users';
import s from '../_ui/simple.module.css';
import { fontVars } from '../_ui/fonts';

// The "quick demo login" buttons that used to live here printed the seeded
// admin, manager and staff passwords directly on the public sign-in page and
// filled them in on click. Anyone who reached /admin/login could read working
// credentials, so the block has been removed — and nothing here lists accounts
// that haven't signed in on this device before.

const tile = {
  width: 170,
  padding: '22px 12px',
  borderRadius: 28,
  font: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  color: '#FFFFFF',
} as const;

/** Turns the login route's replies into plain words. */
function explain(status: number, message: string | undefined): string {
  if (status === 429) {
    const minutes = message?.match(/(\d+) minute/)?.[1];
    return `Too many wrong passwords, so sign-in is paused for safety. Try again in ${minutes ?? '15'} minute${minutes === '1' ? '' : 's'}, or ask the owner.`;
  }
  if (status === 503) return 'Can’t reach the shop’s records right now. Check the internet and try again in a minute.';
  if (status === 401) return 'That email and password don’t match. Check them and try again.';
  return message ?? 'Sign-in didn’t work. Please try again.';
}

export default function LoginPage() {
  const [people, setPeople] = useState<RememberedUser[]>([]);
  const [chosen, setChosen] = useState<RememberedUser | 'other' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Read once on arrival (localStorage and the URL only exist in the browser).
  useEffect(() => {
    const list = readRemembered();
    const reason = new URLSearchParams(window.location.search).get('reason');
    queueMicrotask(() => {
      setPeople(list);
      setChosen(list.length === 0 ? 'other' : null);
      if (reason === 'session-expired') setNotice('You were signed out. Please sign in again.');
    });
  }, []);

  const pick = (who: RememberedUser | 'other') => {
    setChosen(who);
    setEmail(who === 'other' ? '' : who.email);
    setPassword('');
    setError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    // Capture this before the cookie is set: the proxy may redirect this URL.
    const requested = new URLSearchParams(window.location.search).get('next');
    const destination = requested?.startsWith('/admin/') && !requested.startsWith('//') ? requested : '/admin';
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(explain(res.status, json.error));
        setBusy(false);
        return;
      }
      remember({ name: json.user.name, email: json.user.email, role: json.user.role });
      window.location.replace(destination);
    } catch {
      setError('No internet connection. Check it and try again.');
      setBusy(false);
    }
  };

  const who = chosen && chosen !== 'other' ? chosen : null;

  return (
    <div className={`${fontVars} ${s.root}`} style={{ background: 'var(--charcoal)', color: '#fff' }}>
      <main
        style={{
          minHeight: '100dvh',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div className={s.stack} style={{ alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <Image src="/logo-white.png" alt="Darshana Optical" width={600} height={377} priority style={{ height: 64, width: 'auto' }} />
          <h1 className={s.h1} style={{ fontSize: 'clamp(30px, 5vw, 40px)' }}>
            {people.length > 0 ? 'Who is signing in?' : 'Sign in'}
          </h1>
        </div>

        {notice && (
          <p role="status" style={{ margin: 0, padding: '12px 18px', borderRadius: 16, background: 'var(--charcoal-2)', color: '#E6E7EB' }}>
            {notice}
          </p>
        )}

        {people.length > 0 && (
          <div role="radiogroup" aria-label="Choose your name" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {people.map((p) => {
              const on = who?.email === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={s.tap}
                  onClick={() => pick(p)}
                  style={{ ...tile, background: on ? 'var(--charcoal-3)' : 'var(--charcoal-2)', border: `2px solid ${on ? 'var(--orange)' : 'transparent'}` }}
                >
                  <span style={{ width: 84, height: 84, borderRadius: '50%', border: '5px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700 }}>
                    {initials(p.name)}
                  </span>
                  <strong style={{ fontSize: 19 }}>{p.name.split(' ')[0]}</strong>
                  <span style={{ fontSize: 14, color: '#BDBFC8' }}>{roleLabel(p.role)}</span>
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={chosen === 'other'}
              className={s.tap}
              onClick={() => pick('other')}
              style={{ ...tile, background: chosen === 'other' ? 'var(--charcoal-3)' : 'transparent', border: `2px dashed ${chosen === 'other' ? 'var(--orange)' : '#4A4B53'}` }}
            >
              <span style={{ width: 84, height: 84, borderRadius: '50%', border: '3px dashed #6E6F78', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>+</span>
              <strong style={{ fontSize: 19 }}>Someone else</strong>
              <span style={{ fontSize: 14, color: '#BDBFC8' }}>Use your email</span>
            </button>
          </div>
        )}

        {chosen && (
          <form onSubmit={submit} className={s.up} style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {chosen === 'other' ? (
              <label className={s.field} style={{ fontSize: 17 }}>
                Email
                <input
                  id="admin-email"
                  type="email"
                  className={s.input}
                  style={{ background: '#fff', minHeight: 64, fontSize: 19 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  autoFocus
                />
              </label>
            ) : (
              // Keeps the email in the form for password managers without showing it.
              <input id="admin-email" type="email" value={email} readOnly hidden autoComplete="username" />
            )}
            <label className={s.field} style={{ fontSize: 17 }}>
              {who ? `Password for ${who.name.split(' ')[0]}` : 'Password'}
              <span style={{ display: 'flex', alignItems: 'center', minHeight: 64, padding: '0 8px 0 0', borderRadius: 20, background: '#fff' }}>
                <input
                  id="admin-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  autoFocus={chosen !== 'other'}
                  style={{ flex: 1, minWidth: 0, minHeight: 60, padding: '0 20px', border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 20, color: 'var(--ink)' }}
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className={`${s.btn} ${s.btnSoft}`} style={{ minHeight: 48, padding: '0 16px', fontSize: 15 }}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            {error && (
              <p role="alert" className={s.error} style={{ background: '#FDE6E1' }}>
                {error}
              </p>
            )}
            <button id="admin-login-submit" type="submit" className={`${s.btn} ${s.btnBig} ${s.btnPrimary}`} disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: '#BDBFC8' }}>Forgot password? Ask the owner to reset it in Settings.</p>
            {who && (
              <button
                type="button"
                onClick={() => {
                  const rest = forget(who.email);
                  setPeople(rest);
                  setChosen(rest.length === 0 ? 'other' : null);
                }}
                style={{ alignSelf: 'center', border: 0, background: 'transparent', color: '#BDBFC8', font: 'inherit', fontSize: 15, textDecoration: 'underline', cursor: 'pointer', padding: 10 }}
              >
                Not {who.name.split(' ')[0]}? Remove from this device
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
