import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { createGarden, type Garden } from '@/features/gardens/api';
import { GardenForm } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { PlainTextValidationError, requirePlainText, textLimits } from '@/lib/plain-text';
import { requireUser } from '@/lib/session.server';
import { useMessages } from '@/providers/message-provider';

type ActionData = {
  message?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Add Garden | Rootly' },
  {
    name: 'description',
    content: 'Add a garden to Rootly.',
  },
];

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request);
  const formData = await request.formData();

  try {
    await createGarden(readGardenPayload(formData));

    return redirect('/dashboard/gardens?toast=garden-created');
  } catch (error) {
    const status =
      error instanceof ApiClientError ? error.status : isValidationError(error) ? 400 : 503;
    return json<ActionData>(
      {
        message: isValidationError(error)
          ? error.message
          : 'We could not save this garden right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardGardensNew() {
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
          title="Add new garden"
          description="Track a growing space by dimensions and sun direction."
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard/gardens">Cancel</Link>
            </Button>
          }
        />

        <GardenForm as={Form} isSubmitting={isSubmitting} />
      </PageStack>
    </PageContainer>
  );
}

function readGardenPayload(formData: FormData) {
  const gardenName = requirePlainText(formData.get('gardenName'), 'Garden name', textLimits.name);
  const totalWidth = requiredPositiveNumber(formData.get('totalWidth'));
  const totalHeight = requiredPositiveNumber(formData.get('totalHeight'));
  const gridSizeCm = requiredPositiveInteger(formData.get('gridSizeCm'));

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

class ValidationError extends Error {}

function isValidationError(error: unknown): error is ValidationError | PlainTextValidationError {
  return error instanceof ValidationError || error instanceof PlainTextValidationError;
}

function requiredPositiveInteger(value: FormDataEntryValue | null) {
  const number = Number(String(value || '').trim());

  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError('Grid size is required.');
  }

  return number;
}
