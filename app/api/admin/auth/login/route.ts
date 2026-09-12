import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import {
  hashPassword,
  createSessionToken,
  buildSessionCookieOptions,
} from '@/app/lib/admin/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const rows = await query(
      'SELECT id, name, email, role, password_hash, status FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive. Contact admin.' }, { status: 403 });
    }

    const hash = hashPassword(password);
    if (hash !== user.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Update last_active
    await query('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]);

    const token = createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set(buildSessionCookieOptions(token));
    return res;
  } catch (err: any) {
    console.error('[admin/auth/login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
