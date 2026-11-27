'use client';

// People who have signed in on this device, for the "Who is signing in?" tiles.
//
// Deliberately device-local: listing every active user before sign-in would
// need an unauthenticated endpoint that reveals staff names and emails, which
// the login route is careful never to do (one generic error for every failure).
// No passwords or tokens are stored — only what the tile shows plus the email
// it fills in.

import type { Role } from './session-token';

export interface RememberedUser {
  name: string;
  email: string;
  role: Role;
}

const KEY = 'darshana-recent-users';
const MAX = 6;

export function readRemembered(): RememberedUser[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(list)) return [];
    return list
      .filter((u) => u && typeof u.name === 'string' && typeof u.email === 'string' && ['admin', 'manager', 'staff'].includes(u.role))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function remember(user: RememberedUser): void {
  try {
    const rest = readRemembered().filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(KEY, JSON.stringify([{ name: user.name, email: user.email, role: user.role }, ...rest].slice(0, MAX)));
  } catch {
    // Private mode or storage full: the tiles are a convenience only.
  }
}

export function forget(email: string): RememberedUser[] {
  const next = readRemembered().filter((u) => u.email.toLowerCase() !== email.toLowerCase());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
