import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { PageContainer, PageStack } from '@/components/layout';
import { PageTitle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { createGarden, type Garden } from '@/features/gardens/api';
import { GardenForm } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

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
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        message: 'We could not save this garden right now. Please check the details and try again.',
      },
      { status },
    );
  }
}

export default function DashboardGardensNew() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

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

        {actionData?.message ? (
          <div
            role="alert"
            className="rounded-md border border-[var(--rootly-danger)]/30 bg-[var(--rootly-surface)] px-4 py-3 text-sm text-[var(--rootly-text)]"
          >
            {actionData.message}
          </div>
        ) : null}

        <GardenForm as={Form} isSubmitting={isSubmitting} />
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
