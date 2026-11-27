'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import SimpleShell from '../_ui/SimpleShell';
import AdminLoader from './AdminLoader';

const PUBLIC_PATHS = ['/admin/login'];

/** Waits for the session, sends signed-out visitors to sign-in, then shows the menu. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isPublic) router.replace('/admin/login');
    if (user && isPublic) router.replace('/admin');
  }, [user, isLoading, isPublic, router]);

  if (isLoading) return <AdminLoader label="Opening the shop" fullScreen />;
  if (isPublic || !user) return <>{children}</>;
  return <SimpleShell>{children}</SimpleShell>;
}
