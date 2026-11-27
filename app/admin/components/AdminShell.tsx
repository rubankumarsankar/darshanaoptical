'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import SimpleShell from '../_ui/SimpleShell';
import AdminLoader from './AdminLoader';

const PUBLIC_PATHS = ['/admin/login'];

/** Waits for the session, sends signed-out visitors to sign-in, then shows the menu. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, connectionError, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (isLoading || connectionError) return;
    if (!user && !isPublic) router.replace('/admin/login');
    if (user && isPublic) router.replace('/admin');
  }, [user, isLoading, connectionError, isPublic, router]);

  if (isLoading) return <AdminLoader label="Opening the shop" fullScreen />;
  if (connectionError && !user) return <ConnectionError onRetry={retry} />;
  // While the redirect above runs, show the loader rather than a page the
  // visitor can't use (signed out) or no longer needs (signed in on sign-in).
  if (!user && !isPublic) return <AdminLoader label="Taking you to sign in" fullScreen />;
  if (user && isPublic) return <AdminLoader label="Opening the shop" fullScreen />;
  if (!user) return <>{children}</>;
  return <SimpleShell>{children}</SimpleShell>;
}

function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: '#F3F2EF', color: '#1F2024', textAlign: 'center' }}>
      <strong style={{ fontSize: 22 }}>Can’t connect right now</strong>
      <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.5, color: '#5B5D63' }}>
        Check the shop’s internet connection, then try again. You are still signed in.
      </p>
      <button type="button" onClick={onRetry} style={{ minHeight: 56, padding: '0 28px', border: 0, borderRadius: 18, background: '#FD5A05', color: '#1F2024', font: 'inherit', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
