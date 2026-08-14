import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { DashboardShell } from '@/features/dashboard/components';
import { requireUser } from '@/lib/session.server';
import { MessageProvider } from '@/providers/message-provider';

export const meta: MetaFunction = () => [
  { title: 'Dashboard | Rootly' },
  {
    name: 'description',
    content: 'Manage gardens, plants, and care reminders in Rootly.',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <DashboardShell user={user}>
      <MessageProvider>
        <Outlet context={{ user }} />
      </MessageProvider>
    </DashboardShell>
  );
}
