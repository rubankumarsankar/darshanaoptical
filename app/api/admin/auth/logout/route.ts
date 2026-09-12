import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/app/lib/admin/session';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
