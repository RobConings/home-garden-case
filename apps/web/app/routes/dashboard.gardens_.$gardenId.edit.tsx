import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { getGarden, type Garden, updateGarden } from '@/features/gardens/api';
import { GardenForm } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  message?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Edit Garden | Rootly' },
  {
    name: 'description',
    content: 'Edit a garden in Rootly.',
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUser(request);
  const gardenId = Number(params.gardenId);

  if (!Number.isFinite(gardenId)) {
    throw redirect('/dashboard/gardens');
  }

  try {
    const garden = await getGarden(gardenId);
    return { garden };
  } catch {
    throw redirect('/dashboard/gardens');
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUser(request);
  const gardenId = Number(params.gardenId);
  const formData = await request.formData();

  if (!Number.isFinite(gardenId)) {
    throw redirect('/dashboard/gardens');
  }

  try {
    await updateGarden(gardenId, readGardenPayload(formData));

    return redirect('/dashboard/gardens?toast=garden-updated');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        message: 'We could not save this garden right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardGardensEdit() {
  const { garden } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden library"
          title="Edit garden"
          description="Update this garden's dimensions and sun direction."
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard/gardens">Cancel</Link>
            </Button>
          }
        />

        {actionData?.message ? (
          <div
            role="alert"
            className="rounded-md border border-[var(--rootly-danger)]/30 bg-[var(--rootly-surface)] px-4 py-3 text-sm text-[var(--rootly-text)]"
          >
            {actionData.message}
          </div>
        ) : null}

        <GardenForm as={Form} garden={garden} isSubmitting={isSubmitting} />
      </PageStack>
    </PageContainer>
  );
}

function readGardenPayload(formData: FormData) {
  return {
    gardenName: String(formData.get('gardenName') || '').trim(),
    locationDescription: null,
    totalWidth: requiredNumber(formData.get('totalWidth')),
    totalHeight: requiredNumber(formData.get('totalHeight')),
    sunDirection: String(formData.get('sunDirection') || 'south') as Garden['sunDirection'],
  };
}

function requiredNumber(value: FormDataEntryValue | null) {
  return Number(String(value || '').trim());
}
