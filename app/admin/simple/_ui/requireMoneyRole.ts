import { redirect } from 'next/navigation';
import { getSessionFromCookie } from '@/app/lib/admin/session';
import { canSeeMoney } from '@/app/lib/admin/simple';

/**
 * Page guard for owner/manager-only screens, so staff typing the address never
 * see the page. Like proxy.ts it only checks the signed cookie: the money API
 * routes behind these pages call requireRole(), which re-reads the user's
 * current role from the database, and that is the real boundary.
 */
export async function requireMoneyRole() {
  const session = await getSessionFromCookie();
  if (!session) redirect('/admin/login');
  if (!canSeeMoney(session.role)) redirect('/admin/simple');
}
