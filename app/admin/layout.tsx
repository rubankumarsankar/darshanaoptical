import type { Metadata } from 'next';
import s from './_ui/simple.module.css';
import { fontVars } from './_ui/fonts';
import AdminShell from './_ui/AdminShell';
import { AuthProvider } from '@/app/lib/admin/auth-context';

export const metadata: Metadata = {
  title: { default: 'Darshana Optical — Admin', template: '%s | Admin' },
  description: 'Darshana Optical shop admin',
  robots: { index: false, follow: false },
};

// Sign-in gating: proxy.ts rejects visitors without a valid cookie, AdminShell
// waits for /auth/me before showing anything, and every API route re-checks
// the session and role. This layout supplies the fonts, colours and menu.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fontVars} ${s.root}`} data-lenis-prevent>
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </div>
  );
}
