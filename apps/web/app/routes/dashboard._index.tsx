import type { MetaFunction } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';
import { DashboardHome } from '@/features/dashboard/components';
import type { UserSession } from '@/lib/session.server';

type DashboardOutletContext = {
  user: UserSession;
};

export const meta: MetaFunction = () => [
  { title: 'Dashboard | Rootly' },
  {
    name: 'description',
    content: 'Manage gardens, plants, and care reminders in Rootly.',
  },
];

export default function DashboardIndex() {
  const { user } = useOutletContext<DashboardOutletContext>();

  return <DashboardHome user={user} />;
}
