import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  getPlantLibraryEntry,
  type PlantLibraryEntry,
  updatePlantLibraryEntry,
} from '@/features/plants/api';
import { PlantLibraryForm } from '@/features/plants/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  message?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Edit Plant | Rootly' },
  {
    name: 'description',
    content: 'Edit a custom plant in Rootly.',
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const plantLibraryId = Number(params.plantLibraryId);

  if (!Number.isFinite(plantLibraryId)) {
    throw redirect('/dashboard/plants');
  }

  try {
    const plant = await getPlantLibraryEntry(plantLibraryId, user.userId);

    if (plant.source !== 'user') {
      throw redirect('/dashboard/plants');
    }

    return { plant };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    throw redirect('/dashboard/plants');
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const plantLibraryId = Number(params.plantLibraryId);
  const formData = await request.formData();

  if (!Number.isFinite(plantLibraryId)) {
    throw redirect('/dashboard/plants');
  }

  try {
    await updatePlantLibraryEntry(plantLibraryId, user.userId, readPlantPayload(formData));

    return redirect('/dashboard/plants?toast=plant-updated');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        message: 'We could not save this plant right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardPlantsEdit() {
  const { plant } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Plant library"
          title="Edit plant"
          description="Update this plant's care preferences."
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard/plants">Cancel</Link>
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

        <PlantLibraryForm as={Form} plant={plant} isSubmitting={isSubmitting} />
      </PageStack>
    </PageContainer>
  );
}

function readPlantPayload(formData: FormData) {
  return {
    commonName: String(formData.get('commonName') || ''),
    botanicalName: optionalString(formData.get('botanicalName')),
    plantCategory: String(
      formData.get('plantCategory') || 'vegetable',
    ) as PlantLibraryEntry['plantCategory'],
    waterNeed: String(formData.get('waterNeed') || 'moderate') as PlantLibraryEntry['waterNeed'],
    waterNotes: optionalString(formData.get('waterNotes')),
    sunNeed: String(formData.get('sunNeed') || 'full_sun') as PlantLibraryEntry['sunNeed'],
    sunNotes: optionalString(formData.get('sunNotes')),
    nutritionNeed: String(
      formData.get('nutritionNeed') || 'moderate',
    ) as PlantLibraryEntry['nutritionNeed'],
    nutritionNotes: optionalString(formData.get('nutritionNotes')),
    plantingNotes: optionalString(formData.get('plantingNotes')),
    spacingCm: optionalNumber(formData.get('spacingCm')),
    daysToMaturity: optionalNumber(formData.get('daysToMaturity')),
  };
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  return text ? text : null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  return text ? Number(text) : null;
}
