'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import { activeNav, initials, navFor, roleLabel, tabsFor } from '@/app/lib/admin/simple';
import s from './simple.module.css';
import NavItem from './NavItem';
import { LogOutIcon, MoreIcon, NAV_ICONS, SettingsIcon } from './icons';

/** Menu + content frame. On phones the menu becomes a bottom tab bar plus a "More" sheet. */
export default function SimpleShell({ children }: { children: ReactNode }) {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = activeNav(pathname);
  const items = navFor(role);
  const tabs = tabsFor(role);
  const tabIds = new Set(tabs.map((t) => t.id));
  const moreItems = items.filter((i) => !tabIds.has(i.id));

  const signOut = async () => {
    await logout();
    window.location.replace('/admin/login');
  };

  const whoBlock = (
    <div className={s.who}>
      <span className={s.avatar} aria-hidden>
        {initials(user?.name)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className={s.whoName}>{user?.name}</span>
        <span className={s.whoRole}>{roleLabel(role)}</span>
      </span>
      <button type="button" className={s.iconBtnDark} aria-label="Log out" onClick={signOut}>
        <LogOutIcon />
      </button>
    </div>
  );

  return (
    <div className={s.shell}>
      <nav aria-label="Main" className={s.menu}>
        <Link href="/admin/simple" className={s.brand}>
          <Image src="/logo-white.png" alt="" width={600} height={377} priority style={{ height: 32, width: 'auto' }} />
          <span>Darshana</span>
        </Link>
        <ul className={s.navList}>
          {items.map((item) => (
            <li key={item.id}>
              <NavItem href={item.href} label={item.label} icon={NAV_ICONS[item.id]} active={active === item.id} emphasis={item.id === 'sale'} />
            </li>
          ))}
        </ul>
        <div className={s.menuFoot}>
          <NavItem href="/admin/simple/settings" label="Settings" icon={<SettingsIcon />} active={active === 'settings'} className={s.settingsLink} />
          {whoBlock}
        </div>
      </nav>

      <main id="main" className={s.main}>
        {children}
      </main>

      <nav aria-label="Main" className={s.tabBar}>
        {tabs.map((tab) => (
          <Link key={tab.id} href={tab.href} className={s.tab} aria-current={active === tab.id ? 'page' : undefined}>
            {NAV_ICONS[tab.id]}
            {tab.id === 'sale' ? 'Sale' : tab.label}
          </Link>
        ))}
        <button
          type="button"
          className={s.tab}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-current={active && !tabIds.has(active as never) ? 'page' : undefined}
          onClick={() => setMoreOpen(true)}
        >
          <MoreIcon />
          More
        </button>
      </nav>

      {moreOpen && (
        <div
          className={s.moreSheet}
          role="dialog"
          aria-modal="true"
          aria-label="More"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMoreOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMoreOpen(false);
          }}
        >
          <div className={s.moreSheetPanel}>
            {moreItems.map((item) => (
              <NavItem
                key={item.id}
                href={item.href}
                label={item.label}
                icon={NAV_ICONS[item.id]}
                active={active === item.id}
                onClick={() => setMoreOpen(false)}
              />
            ))}
            <NavItem href="/admin/simple/settings" label="Settings" icon={<SettingsIcon />} active={active === 'settings'} onClick={() => setMoreOpen(false)} />
            {whoBlock}
            <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={() => setMoreOpen(false)} autoFocus>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
