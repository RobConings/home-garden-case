import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useLoaderData } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { deleteGarden, getGardens } from '@/features/gardens/api';
import { GardenList } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';
import { useRouteMessages } from '@/providers/message-provider';

type ActionData = {
  message: string;
};

export const meta: MetaFunction = () => [
  { title: 'Gardens | Rootly' },
  {
    name: 'description',
    content: 'Manage gardens and their growing space in Rootly.',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const url = new URL(request.url);

  if (url.searchParams.get('new') === '1') {
    throw redirect('/dashboard/gardens/new');
  }

  const editParam = url.searchParams.get('edit');
  const editId = editParam ? Number(editParam) : Number.NaN;

  if (Number.isFinite(editId)) {
    throw redirect(`/dashboard/gardens/${editId}/edit`);
  }

  const gardens = await getGardens();
  const toastMessage = getToastMessage(url.searchParams.get('toast'));

  return { gardens, toastMessage };
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request);
  const formData = await request.formData();
  const intent = String(formData.get('intent') || '');

  try {
    if (intent === 'delete') {
      const gardenId = Number(formData.get('gardenId'));
      await deleteGarden(gardenId);

      return redirect('/dashboard/gardens?toast=garden-deleted');
    }

    throw new Error('Unsupported garden action.');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        message:
          intent === 'delete'
            ? 'We could not delete this garden right now. Please try again.'
            : 'We could not save this garden right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardGardens() {
  const { gardens, toastMessage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  useRouteMessages({
    successMessage: toastMessage,
    errorMessage: actionData?.message,
  });

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden library"
          title="Gardens"
          description="Track each growing space by dimensions and sun direction."
          actions={
            <Button asChild>
              <Link to="/dashboard/gardens/new">Add new garden</Link>
            </Button>
          }
        />

        <GardenList gardens={gardens} />
      </PageStack>
    </PageContainer>
  );
}

function getToastMessage(value: string | null) {
  switch (value) {
    case 'garden-created':
      return 'Garden added.';
    case 'garden-updated':
      return 'Garden changes saved.';
    case 'garden-deleted':
      return 'Garden removed.';
    default:
      return null;
  }
}
