import { requireMoneyRole } from '../_ui/requireMoneyRole';

export default async function OwnerOnlyLayout({ children }: { children: React.ReactNode }) {
  await requireMoneyRole();
  return children;
}
