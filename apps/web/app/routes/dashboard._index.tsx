import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { DashboardHome } from '@/features/dashboard/components';
import { getGardens } from '@/features/gardens/api';
import { getPlantLibraryPage } from '@/features/plants/api';
import { requireUser } from '@/lib/session.server';

export const meta: MetaFunction = () => [
  { title: 'Dashboard | Rootly' },
  {
    name: 'description',
    content: 'Manage gardens, plants, and care reminders in Rootly.',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const [gardens, plantPage] = await Promise.all([
    getGardens(),
    getPlantLibraryPage(user.userId, { limit: 1, offset: 0 }),
  ]);
  const growingAreaM2 = gardens.reduce(
    (total, garden) => total + (garden.totalSurfaceArea || garden.totalWidth * garden.totalHeight),
    0,
  );
  const recentGardens = [...gardens]
    .sort((firstGarden, secondGarden) => {
      return Date.parse(secondGarden.updatedAt) - Date.parse(firstGarden.updatedAt);
    })
    .slice(0, 3);

  return json({
    stats: {
      gardenCount: gardens.length,
      plantCount: plantPage.total,
      careTaskCount: 0,
      growingAreaM2,
    },
    recentGardens,
  });
}

export default function DashboardIndex() {
  const { stats, recentGardens } = useLoaderData<typeof loader>();

  return <DashboardHome stats={stats} recentGardens={recentGardens} />;
}
