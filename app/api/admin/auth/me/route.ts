import { NextResponse } from 'next/server';
import { requireSession } from '@/app/lib/admin/session';

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  return NextResponse.json({ user: session });
}
