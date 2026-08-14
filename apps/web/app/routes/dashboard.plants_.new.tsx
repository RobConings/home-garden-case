import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { createPlantLibraryEntry, type PlantLibraryEntry } from '@/features/plants/api';
import { PlantLibraryForm } from '@/features/plants/components';
import { ApiClientError } from '@/lib/api.server';
import {
  optionalPlainText,
  PlainTextValidationError,
  requirePlainText,
  textLimits,
} from '@/lib/plain-text';
import { requireUser } from '@/lib/session.server';
import { useMessages } from '@/providers/message-provider';

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
    const status =
      error instanceof ApiClientError
        ? error.status
        : error instanceof PlainTextValidationError
          ? 400
          : 503;
    return json<ActionData>(
      {
        message:
          error instanceof PlainTextValidationError
            ? error.message
            : 'We could not save this plant right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardPlantsNew() {
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
          eyebrow="Plant library"
          title="Add new plant"
          description="Save a plant you grow often with its care preferences."
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard/plants">Cancel</Link>
            </Button>
          }
        />

        <PlantLibraryForm as={Form} isSubmitting={isSubmitting} />
      </PageStack>
    </PageContainer>
  );
}

function readPlantPayload(formData: FormData) {
  return {
    commonName: requirePlainText(formData.get('commonName'), 'Plant name', textLimits.name),
    botanicalName: optionalPlainText(
      formData.get('botanicalName'),
      'Botanical name',
      textLimits.shortText,
    ),
    plantCategory: String(
      formData.get('plantCategory') || 'vegetable',
    ) as PlantLibraryEntry['plantCategory'],
    waterNeed: String(formData.get('waterNeed') || 'moderate') as PlantLibraryEntry['waterNeed'],
    waterNotes: optionalPlainText(formData.get('waterNotes'), 'Water notes', textLimits.notes),
    sunNeed: String(formData.get('sunNeed') || 'full_sun') as PlantLibraryEntry['sunNeed'],
    sunNotes: optionalPlainText(formData.get('sunNotes'), 'Sun notes', textLimits.notes),
    nutritionNeed: String(
      formData.get('nutritionNeed') || 'moderate',
    ) as PlantLibraryEntry['nutritionNeed'],
    nutritionNotes: optionalPlainText(
      formData.get('nutritionNotes'),
      'Nutrition notes',
      textLimits.notes,
    ),
    plantingNotes: optionalPlainText(
      formData.get('plantingNotes'),
      'Planting notes',
      textLimits.notes,
    ),
    spacingCm: optionalNumber(formData.get('spacingCm')),
    daysToMaturity: optionalNumber(formData.get('daysToMaturity')),
  };
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
