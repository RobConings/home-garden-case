import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react';
import { PageContainer, PageRow, PageStack } from '@/components/layout';
import { EmptyState, GeneralList, PageTitle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createGarden,
  deleteGarden,
  getGarden,
  getGardens,
  type Garden,
  updateGarden,
} from '@/features/gardens/api';
import { GardenForm } from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  toast?: ToastData;
};

type ToastData = {
  type: 'success' | 'error';
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
  const gardens = await getGardens();
  const url = new URL(request.url);
  const isCreating = url.searchParams.get('new') === '1';
  const editParam = url.searchParams.get('edit');
  const editId = editParam ? Number(editParam) : Number.NaN;
  const toast = getToast(url.searchParams.get('toast'));
  const editGarden = Number.isFinite(editId) ? await getEditableGarden(editId) : null;

  return { gardens, editGarden, isCreating, toast };
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

    const payload = readGardenPayload(formData);

    if (intent === 'update') {
      const gardenId = Number(formData.get('gardenId'));
      await updateGarden(gardenId, payload);

      return redirect('/dashboard/gardens?toast=garden-updated');
    }

    await createGarden(payload);

    return redirect('/dashboard/gardens?toast=garden-created');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        toast: {
          type: 'error',
          message:
            intent === 'delete'
              ? 'We could not delete this garden right now. Please try again.'
              : 'We could not save this garden right now. Please check the details and try again.',
        },
      },
      { status },
    );
  }
}

export default function DashboardGardens() {
  const { gardens, editGarden, isCreating, toast } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const showForm = isCreating || Boolean(editGarden);
  const visibleToast = actionData?.toast ?? toast;

  return (
    <PageContainer minHeight="content" className="py-8">
      <ToastMessage toast={visibleToast} />
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden library"
          title="Gardens"
          description="Track each growing space by location, dimensions, and sun direction."
          actions={
            showForm ? (
              <Button asChild variant="secondary">
                <Link to="/dashboard/gardens">Cancel</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/dashboard/gardens?new=1">Add new garden</Link>
              </Button>
            )
          }
        />

        {showForm ? (
          <GardenForm
            key={editGarden?.gardenId ?? 'create'}
            as={Form}
            garden={editGarden ?? undefined}
            isSubmitting={isSubmitting}
          />
        ) : null}

        <GeneralList
          items={gardens}
          getKey={(garden) => garden.gardenId}
          getSearchText={(garden) =>
            [
              garden.gardenName,
              garden.locationDescription,
              garden.sunDirection,
              formatSunDirection(garden.sunDirection),
              `${garden.totalWidth}m wide`,
              `${garden.totalHeight}m high`,
            ]
              .filter(Boolean)
              .join(' ')
          }
          searchPlaceholder="Search gardens"
          emptyState={
            <EmptyState
              title="No gardens found"
              description="Try a different search or add a new garden."
            />
          }
          renderCard={(garden) => <GardenCard garden={garden} />}
          columns={[
            {
              key: 'name',
              label: 'Garden',
              render: (garden) => (
                <div>
                  <p className="font-medium text-[var(--rootly-text)]">{garden.gardenName}</p>
                  <p className="text-xs text-[var(--rootly-text-muted)]">
                    {garden.locationDescription}
                  </p>
                </div>
              ),
            },
            {
              key: 'size',
              label: 'Size',
              render: (garden) => `${garden.totalWidth} x ${garden.totalHeight} m`,
            },
            {
              key: 'sun',
              label: 'Sun',
              render: (garden) => formatSunDirection(garden.sunDirection),
            },
            {
              key: 'actions',
              label: 'Actions',
              className: 'w-32 text-right',
              render: (garden) => <GardenActions garden={garden} />,
            },
          ]}
        />
      </PageStack>
    </PageContainer>
  );
}

function GardenCard({ garden }: { garden: Garden }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <PageRow align="between" gap="sm">
          <CardTitle>{garden.gardenName}</CardTitle>
          <Badge variant="success">{formatSunDirection(garden.sunDirection)}</Badge>
        </PageRow>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-[var(--rootly-text-muted)]">
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Postal code:</span>{' '}
          {garden.locationDescription}
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Dimensions:</span>{' '}
          {garden.totalWidth} x {garden.totalHeight} m
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Growing area:</span>{' '}
          {formatArea(garden.totalSurfaceArea)} m2
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <GardenActions garden={garden} />
      </CardFooter>
    </Card>
  );
}

function GardenActions({ garden }: { garden: Garden }) {
  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link to={`/dashboard/gardens?edit=${garden.gardenId}`}>
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Edit
        </Link>
      </Button>
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="gardenId" value={garden.gardenId} />
        <Button type="submit" variant="danger" size="sm">
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          Delete
        </Button>
      </Form>
    </div>
  );
}

function ToastMessage({ toast }: { toast?: ToastData | null }) {
  const [isVisible, setIsVisible] = useState(Boolean(toast));

  useEffect(() => {
    setIsVisible(Boolean(toast));

    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(false), 5000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!toast || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);

    if (url.searchParams.has('toast')) {
      url.searchParams.delete('toast');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [toast]);

  if (!toast || !isVisible) {
    return null;
  }

  const isSuccess = toast.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      aria-live={isSuccess ? 'polite' : 'assertive'}
      className={[
        'fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-md border bg-[var(--rootly-surface)] px-4 py-3 text-sm shadow-lg',
        isSuccess
          ? 'border-[var(--rootly-success)]/30 text-[var(--rootly-success)]'
          : 'border-[var(--rootly-danger)]/30 text-[var(--rootly-danger)]',
      ].join(' ')}
      role={isSuccess ? 'status' : 'alert'}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-[var(--rootly-text)]">{toast.message}</p>
    </div>
  );
}

function readGardenPayload(formData: FormData) {
  const totalWidth = requiredNumber(formData.get('totalWidth'));
  const totalHeight = requiredNumber(formData.get('totalHeight'));

  return {
    gardenName: String(formData.get('gardenName') || '').trim(),
    locationDescription: optionalString(formData.get('locationDescription')),
    totalWidth,
    totalHeight,
    sunDirection: String(formData.get('sunDirection') || 'south') as Garden['sunDirection'],
  };
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  return text ? text : null;
}

function requiredNumber(value: FormDataEntryValue | null) {
  return Number(String(value || '').trim());
}

async function getEditableGarden(gardenId: number) {
  try {
    return await getGarden(gardenId);
  } catch {
    return null;
  }
}

function formatSunDirection(value: Garden['sunDirection']) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatArea(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getToast(value: string | null): ToastData | null {
  switch (value) {
    case 'garden-created':
      return {
        type: 'success',
        message: 'Garden added.',
      };
    case 'garden-updated':
      return {
        type: 'success',
        message: 'Garden changes saved.',
      };
    case 'garden-deleted':
      return {
        type: 'success',
        message: 'Garden removed.',
      };
    default:
      return null;
  }
}
