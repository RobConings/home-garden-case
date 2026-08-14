import type { MetaFunction } from '@remix-run/node';
import { CareOverview } from '@/features/care/components';

export const meta: MetaFunction = () => [
  { title: 'Care | Rootly' },
  {
    name: 'description',
    content: 'Review watering, sunlight, and nutrition care plans in Rootly.',
  },
];

export default function DashboardCare() {
  return <CareOverview />;
}
