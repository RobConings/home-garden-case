import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { getGarden, type Garden, updateGarden } from '@/features/gardens/api';
import { GardenForm } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';
import { useMessages } from '@/providers/message-provider';

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
    const status =
      error instanceof ApiClientError ? error.status : error instanceof ValidationError ? 400 : 503;
    return json<ActionData>(
      {
        message:
          error instanceof ValidationError
            ? error.message
            : 'We could not save this garden right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardGardensEdit() {
  const { garden } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { showError } = useMessages();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.message) {
      showError(actionData.message);
    }
  }, [actionData?.message, showError]);

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

        <GardenForm as={Form} garden={garden} isSubmitting={isSubmitting} />
      </PageStack>
    </PageContainer>
  );
}

function readGardenPayload(formData: FormData) {
  const gardenName = sanitizeText(formData.get('gardenName'));
  const totalWidth = requiredPositiveNumber(formData.get('totalWidth'));
  const totalHeight = requiredPositiveNumber(formData.get('totalHeight'));
  const gridSizeCm = requiredPositiveInteger(formData.get('gridSizeCm'));

  if (!gardenName) {
    throw new ValidationError('Garden name is required.');
  }

  return {
    gardenName,
    locationDescription: null,
    totalWidth,
    totalHeight,
    gridSizeCm,
    sunDirection: String(formData.get('sunDirection') || 'south') as Garden['sunDirection'],
  };
}

function requiredPositiveNumber(value: FormDataEntryValue | null) {
  const number = Number(String(value || '').trim());

  if (!Number.isFinite(number) || number <= 0) {
    throw new ValidationError('Garden width and height are required.');
  }

  return number;
}

function sanitizeText(value: FormDataEntryValue | null) {
  return String(value || '').trim();
}

class ValidationError extends Error {}

function requiredPositiveInteger(value: FormDataEntryValue | null) {
  const number = Number(String(value || '').trim());

  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError('Grid size is required.');
  }

  return number;
}
