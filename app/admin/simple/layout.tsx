import type { Metadata } from 'next';
import s from './_ui/simple.module.css';
import SimpleShell from './_ui/SimpleShell';
import { fontVars } from './_ui/fonts';

export const metadata: Metadata = {
  title: { default: 'Darshana Optical', template: '%s | Darshana Optical' },
  robots: { index: false, follow: false },
};

// Sign-in gating stays where it was: proxy.ts rejects visitors without a valid
// cookie, AdminShell (in the parent layout) waits for /auth/me, and every API
// route re-checks the session and role. This layout only supplies the look.
export default function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fontVars} ${s.root}`}>
      <SimpleShell>{children}</SimpleShell>
    </div>
  );
}
