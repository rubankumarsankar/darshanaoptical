'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { Bell, Plus, Search, Zap } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/counter': 'Express Walk-in Counter',
  '/admin/dashboard': 'Dashboard',
  '/admin/customers': 'Customers',
  '/admin/customers/new': 'New Customer',
  '/admin/eye-tests': 'Eye Tests',
  '/admin/eye-tests/new': 'New Eye Test',
  '/admin/orders': 'Orders',
  '/admin/pos': 'POS / Billing',
  '/admin/invoices': 'Invoices',
  '/admin/payments': 'Payments',
  '/admin/products': 'Products',
  '/admin/products/frames': 'Frames',
  '/admin/products/lenses': 'Lenses',
  '/admin/products/sunglasses': 'Sunglasses',
  '/admin/inventory': 'Inventory',
  '/admin/suppliers': 'Suppliers',
  '/admin/purchases': 'Purchases',
  '/admin/expenses': 'Expenses',
  '/admin/reports': 'Reports',
  '/admin/staff': 'Staff Management',
  '/admin/audit': 'Audit Logs',
  '/admin/settings': 'Settings',
};

const PAGE_ACTIONS: Record<string, { label: string; href: string }> = {
  '/admin/customers': { label: 'New Customer', href: '/admin/customers/new' },
  '/admin/eye-tests': { label: 'New Eye Test', href: '/admin/eye-tests/new' },
  '/admin/pos': { label: 'New Sale', href: '/admin/pos' },
};

function getTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val;
  }
  return 'Admin';
}

export default function TopBar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const title = getTitle(pathname);
  const action = PAGE_ACTIONS[pathname];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!user) return null;

  return (
    <header className="adm-topbar">
      <div className="adm-topbar-title">
        {title}
        <div style={{ fontSize: 11.5, fontWeight: 400, color: '#94a3b8', marginTop: 1 }}>{today}</div>
      </div>

      <div className="adm-topbar-actions">
        {pathname !== '/admin/counter' && (
          <Link
            href="/admin/counter"
            className="adm-btn adm-btn-secondary"
            style={{ height: 36, fontSize: 12.5, fontWeight: 700, borderColor: '#fc5a06', color: '#fc5a06' }}
          >
            <Zap width={14} height={14} /> Express Counter
          </Link>
        )}

        {action && (
          <Link href={action.href} className="adm-btn adm-btn-primary" style={{ height: 36, fontSize: 13 }}>
            <Plus width={14} height={14} />
            {action.label}
          </Link>
        )}

        <button className="adm-btn adm-btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: 8 }}>
          <Bell width={16} height={16} />
        </button>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#fc5a06',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
