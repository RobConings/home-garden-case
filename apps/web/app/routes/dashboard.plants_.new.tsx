import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { createPlantLibraryEntry, type PlantLibraryEntry } from '@/features/plants/api';
import { PlantLibraryForm } from '@/features/plants/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  message?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Add Plant | Rootly' },
  {
    name: 'description',
    content: 'Add a custom plant to Rootly.',
  },
];

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  try {
    await createPlantLibraryEntry({
      ...readPlantPayload(formData),
      ownerUserId: user.userId,
    });

    return redirect('/dashboard/plants?toast=plant-created');
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

export default function DashboardPlantsNew() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Plant library"
          title="Add new plant"
          description="Save a plant you grow often with its care preferences."
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

        <PlantLibraryForm as={Form} isSubmitting={isSubmitting} />
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
