import type { MetaFunction } from '@remix-run/node';
import { DashboardHome } from '@/features/dashboard/components';

export const meta: MetaFunction = () => [
  { title: 'Dashboard | Rootly' },
  {
    name: 'description',
    content: 'Manage gardens, plants, and care reminders in Rootly.',
  },
];

export default function DashboardIndex() {
  return <DashboardHome />;
}
