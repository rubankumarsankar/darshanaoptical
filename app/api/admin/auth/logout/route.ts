import { withDb } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { buildClearedSessionCookie } from '@/app/lib/admin/session';

async function POSTHandler() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(buildClearedSessionCookie());
  return res;
}

export const POST = withDb(POSTHandler);
