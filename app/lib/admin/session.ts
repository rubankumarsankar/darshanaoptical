// app/lib/admin/session.ts
// Server-only — import from API routes and Server Components only.

import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'darshana_session';
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('[session] SESSION_SECRET env variable is not set.');
  return s;
}

export interface SessionData {
  userId: string;
  role: 'admin' | 'manager' | 'staff';
  name: string;
  email: string;
  exp: number;
}

// ─── Sign / Verify ────────────────────────────────────────────

function sign(payload: SessionData): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token: string): SessionData | null {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac('sha256', secret()).update(data).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionData;
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Public helpers ───────────────────────────────────────────

export function createSessionToken(data: Omit<SessionData, 'exp'>): string {
  return sign({ ...data, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SEC });
}

export function hashPassword(password: string): string {
  return createHmac('sha256', secret()).update(password).digest('hex');
}

/** Read and verify the session cookie from the incoming request. */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

/** Use in API routes to require auth. Returns 401 response if not authenticated. */
export async function requireSession(): Promise<
  { session: SessionData; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/** Build the Set-Cookie string for the session cookie. */
export function buildSessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SEC,
  };
}
