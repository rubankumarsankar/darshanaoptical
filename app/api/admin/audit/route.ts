import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity');
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];
  if (entity) { sql += ' AND entity = ?'; params.push(entity); }
  if (from)   { sql += ' AND DATE(created_at) >= ?'; params.push(from); }
  if (to)     { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  sql += ' ORDER BY created_at DESC LIMIT 500';
  return NextResponse.json({ logs: await query(sql, params) });
}
