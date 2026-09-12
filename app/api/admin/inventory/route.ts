import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const products = await query('SELECT * FROM products WHERE status=\'active\' ORDER BY category, brand, name LIMIT 1000');
  const movements = await query(
    'SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 200'
  );
  return NextResponse.json({ products, movements });
}
