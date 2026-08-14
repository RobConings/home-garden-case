import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useLoaderData } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  deletePlantLibraryEntry,
  getPlantLibraryPage,
} from '@/features/plants/api';
import { PlantLibraryList } from '@/features/plants/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';
import { useRouteMessages } from '@/providers/message-provider';

type ActionData = {
  message?: string;
};

const plantPageSize = 12;

export const meta: MetaFunction = () => [
  { title: 'Plants | Rootly' },
  {
    name: 'description',
    content: 'Browse and manage plant templates in Rootly.',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const url = new URL(request.url);

  if (url.searchParams.get('new') === '1') {
    throw redirect('/dashboard/plants/new');
  }

  const editParam = url.searchParams.get('edit');
  const editId = editParam ? Number(editParam) : Number.NaN;

  if (Number.isFinite(editId)) {
    throw redirect(`/dashboard/plants/${editId}/edit`);
  }

  const plantPage = await getPlantLibraryPage(user.userId, {
    limit: plantPageSize,
    offset: 0,
  });
  const toastMessage = getToastMessage(url.searchParams.get('toast'));

  return { plantPage, toastMessage };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = String(formData.get('intent') || '');

  try {
    if (intent === 'delete') {
      const plantLibraryId = Number(formData.get('plantLibraryId'));
      await deletePlantLibraryEntry(plantLibraryId, user.userId);

      return redirect('/dashboard/plants?toast=plant-deleted');
    }

    throw new Error('Unsupported plant action.');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        message:
          intent === 'delete'
            ? 'We could not delete this plant right now. Please try again.'
            : 'We could not save this plant right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardPlants() {
  const { plantPage, toastMessage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  useRouteMessages({
    successMessage: toastMessage,
    errorMessage: actionData?.message,
  });

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Plant library"
          title="Plants"
          description="Choose from common plants or add your own care profile."
          actions={
            <Button asChild>
              <Link to="/dashboard/plants/new">Add new plant</Link>
            </Button>
          }
        />

        <PlantLibraryList initialPage={plantPage} />
      </PageStack>
    </PageContainer>
  );
}

function getToastMessage(value: string | null) {
  switch (value) {
    case 'plant-created':
      return 'Plant added to your library.';
    case 'plant-updated':
      return 'Plant changes saved.';
    case 'plant-deleted':
      return 'Plant removed from your library.';
    default:
      return null;
  }
}
