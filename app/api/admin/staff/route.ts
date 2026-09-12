import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';
import { hashPassword } from '@/app/lib/admin/session';

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const rows = await query('SELECT id,name,email,role,phone,status,joined_at,last_active FROM users ORDER BY role, name');
  return NextResponse.json({ staff: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const b = await request.json();
  if (!b.name || !b.email || !b.password || !b.role) {
    return NextResponse.json({ error: 'name, email, password, role required.' }, { status: 400 });
  }
  const id = randomUUID();
  const password_hash = hashPassword(b.password);
  await query(
    `INSERT INTO users (id,name,email,password_hash,role,phone,status,joined_at) VALUES (?,?,?,?,?,?,'active',NOW())`,
    [id, b.name, b.email.toLowerCase(), password_hash, b.role, b.phone||null]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),'CREATE','user',id,`Created staff: ${b.name} (${b.role})`,session.name,session.role]
  );
  const [row] = await query('SELECT id,name,email,role,phone,status,joined_at FROM users WHERE id=?',[id]) as any[];
  return NextResponse.json({ staff: row }, { status: 201 });
}

export async function PUT(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: 'id required.' }, { status: 400 });
  if (b.password) {
    await query('UPDATE users SET name=?,role=?,phone=?,status=?,password_hash=?,updated_at=NOW() WHERE id=?',
      [b.name, b.role, b.phone||null, b.status??'active', hashPassword(b.password), b.id]);
  } else {
    await query('UPDATE users SET name=?,role=?,phone=?,status=?,updated_at=NOW() WHERE id=?',
      [b.name, b.role, b.phone||null, b.status??'active', b.id]);
  }
  const [row] = await query('SELECT id,name,email,role,phone,status,joined_at FROM users WHERE id=?',[b.id]) as any[];
  return NextResponse.json({ staff: row });
}
