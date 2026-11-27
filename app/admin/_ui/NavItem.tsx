import Link from 'next/link';
import type { ReactNode } from 'react';
import s from './simple.module.css';

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  /** "New sale" gets a slightly stronger resting style so it's easy to find. */
  emphasis?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function NavItem({ href, label, icon, active, emphasis, className, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      data-sale={emphasis && !active ? 'true' : undefined}
      className={`${s.navItem} ${className ?? ''}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
}
