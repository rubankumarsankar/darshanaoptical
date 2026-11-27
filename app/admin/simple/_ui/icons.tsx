import { Banknote, Boxes, CalendarDays, Eye, Glasses, Home, LogOut, MoreHorizontal, Package, Plus, ReceiptText, Settings, Users, Wallet } from 'lucide-react';
import type { NavEntry } from '@/app/lib/admin/simple';

const size = { size: 24, strokeWidth: 2.2, 'aria-hidden': true } as const;

export const NAV_ICONS: Record<NavEntry['id'], React.ReactNode> = {
  home: <Home {...size} />,
  sale: <Plus {...size} />,
  bills: <ReceiptText {...size} />,
  bookings: <CalendarDays {...size} />,
  customers: <Users {...size} />,
  orders: <Package {...size} />,
  products: <Glasses {...size} />,
  stock: <Boxes {...size} />,
  money: <Wallet {...size} />,
};

export const SettingsIcon = () => <Settings size={20} strokeWidth={2.2} aria-hidden />;
export const LogOutIcon = () => <LogOut size={18} strokeWidth={2.2} aria-hidden />;
export const MoreIcon = () => <MoreHorizontal size={24} strokeWidth={2.2} aria-hidden />;
export const EyeIcon = Eye;
export const CashIcon = Banknote;
