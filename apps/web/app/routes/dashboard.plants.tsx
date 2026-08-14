import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react';
import { PageContainer, PageRow, PageStack } from '@/components/layout';
import { EmptyState, GeneralList, PageTitle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlantLibraryEntry,
  deletePlantLibraryEntry,
  getPlantLibraryPage,
  type PlantLibraryEntry,
  type PlantLibraryPage,
  updatePlantLibraryEntry,
} from '@/features/plants/api';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  toast?: ToastData;
};

type ToastData = {
  type: 'success' | 'error';
  message: string;
};

type PlantLibraryResourceData = PlantLibraryPage & {
  search: string;
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

  const plantPage = await getPlantLibraryPage(user.userId, {
    limit: plantPageSize,
    offset: 0,
  });
  const editParam = url.searchParams.get('edit');
  const editId = editParam ? Number(editParam) : Number.NaN;
  if (Number.isFinite(editId)) {
    throw redirect(`/dashboard/plants/${editId}/edit`);
  }

  const toast = getToast(url.searchParams.get('toast'));

  return { user, plantPage, toast };
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

    const payload = readPlantPayload(formData);

    if (intent === 'update') {
      const plantLibraryId = Number(formData.get('plantLibraryId'));
      await updatePlantLibraryEntry(plantLibraryId, user.userId, payload);

      return redirect('/dashboard/plants?toast=plant-updated');
    }

    await createPlantLibraryEntry({
      ...payload,
      ownerUserId: user.userId,
    });

    return redirect('/dashboard/plants?toast=plant-created');
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 503;
    return json<ActionData>(
      {
        toast: {
          type: 'error',
          message:
            intent === 'delete'
              ? 'We could not delete this plant right now. Please try again.'
              : 'We could not save this plant right now. Please check the details and try again.',
        },
      },
      { status },
    );
  }
}

export default function DashboardPlants() {
  const { plantPage, toast } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const plantFetcher = useFetcher<PlantLibraryResourceData>();
  const initialSearchSkipped = useRef(false);
  const [query, setQuery] = useState('');
  const [plants, setPlants] = useState(plantPage.items);
  const [hasMore, setHasMore] = useState(plantPage.hasMore);
  const isLoadingPlants = plantFetcher.state !== 'idle';
  const visibleToast = actionData?.toast ?? toast;

  useEffect(() => {
    setPlants(plantPage.items);
    setHasMore(plantPage.hasMore);
  }, [plantPage.hasMore, plantPage.items]);

  useEffect(() => {
    const plantPageData = plantFetcher.data;
    if (!plantPageData) {
      return;
    }

    if (plantPageData.search !== query.trim()) {
      return;
    }

    setHasMore(plantPageData.hasMore);
    setPlants((currentPlants) => {
      if (plantPageData.offset === 0) {
        return plantPageData.items;
      }

      const currentPlantIds = new Set(currentPlants.map((plant) => plant.plantLibraryId));
      const newPlants = plantPageData.items.filter(
        (plant) => !currentPlantIds.has(plant.plantLibraryId),
      );

      return [...currentPlants, ...newPlants];
    });
  }, [plantFetcher.data, query]);

  useEffect(() => {
    if (!initialSearchSkipped.current) {
      initialSearchSkipped.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      plantFetcher.load(createPlantResourceUrl({ search: query, offset: 0 }));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const handlePlantSearchChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setHasMore(false);
  }, []);

  const loadMorePlants = useCallback(() => {
    if (isLoadingPlants || !hasMore) {
      return;
    }

    plantFetcher.load(createPlantResourceUrl({ search: query, offset: plants.length }));
  }, [hasMore, isLoadingPlants, plantFetcher, plants.length, query]);

  return (
    <PageContainer minHeight="content" className="py-8">
      <ToastMessage toast={visibleToast} />
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

        <GeneralList
          items={plants}
          getKey={(plant) => plant.plantLibraryId}
          getSearchText={(plant) =>
            [
              plant.commonName,
              plant.botanicalName,
              plant.plantCategory,
              plant.waterNeed,
              `${plant.waterNeed} water`,
              `water ${plant.waterNeed}`,
              plant.sunNeed,
              `${formatSun(plant.sunNeed)} sun`,
              `sun ${formatSun(plant.sunNeed)}`,
              plant.nutritionNeed,
              `${plant.nutritionNeed} nutrition`,
              `nutrition ${plant.nutritionNeed}`,
            ]
              .filter(Boolean)
              .join(' ')
          }
          searchPlaceholder="Search plants"
          searchValue={query}
          onSearchChange={handlePlantSearchChange}
          hasMore={hasMore}
          isLoading={isLoadingPlants}
          onLoadMore={loadMorePlants}
          emptyState={
            <EmptyState
              title="No plants found"
              description="Try a different search or add a new plant."
            />
          }
          renderCard={(plant) => <PlantCard plant={plant} />}
          columns={[
            {
              key: 'name',
              label: 'Plant',
              render: (plant) => (
                <div>
                  <p className="font-medium text-[var(--rootly-text)]">{plant.commonName}</p>
                  {plant.botanicalName ? (
                    <p className="text-xs italic text-[var(--rootly-text-muted)]">
                      {plant.botanicalName}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'care',
              label: 'Care',
              render: (plant) => (
                <span>
                  {formatNeed(plant.waterNeed)} water, {formatSun(plant.sunNeed)}
                </span>
              ),
            },
            {
              key: 'nutrition',
              label: 'Nutrition',
              render: (plant) => formatNeed(plant.nutritionNeed),
            },
            {
              key: 'actions',
              label: 'Actions',
              className: 'w-32 text-right',
              render: (plant) => <PlantActions plant={plant} />,
            },
          ]}
        />
      </PageStack>
    </PageContainer>
  );
}

function PlantCard({ plant }: { plant: PlantLibraryEntry }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <PageRow align="between" gap="sm">
          <div>
            <CardTitle>{plant.commonName}</CardTitle>
            {plant.botanicalName ? (
              <p className="mt-1 text-xs italic text-[var(--rootly-text-muted)]">
                {plant.botanicalName}
              </p>
            ) : null}
          </div>
          <Badge variant={plant.source === 'system' ? 'neutral' : 'success'}>
            {plant.source === 'system' ? 'Seeded' : 'Custom'}
          </Badge>
        </PageRow>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-[var(--rootly-text-muted)]">
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Water:</span>{' '}
          {formatNeed(plant.waterNeed)}
          {plant.waterNotes ? `. ${plant.waterNotes}` : ''}
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Sun:</span>{' '}
          {formatSun(plant.sunNeed)}
          {plant.sunNotes ? `. ${plant.sunNotes}` : ''}
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Nutrition:</span>{' '}
          {formatNeed(plant.nutritionNeed)}
          {plant.nutritionNotes ? `. ${plant.nutritionNotes}` : ''}
        </p>
      </CardContent>
      {plant.source === 'user' ? (
        <CardFooter className="justify-end">
          <PlantActions plant={plant} />
        </CardFooter>
      ) : null}
    </Card>
  );
}

function PlantActions({ plant }: { plant: PlantLibraryEntry }) {
  if (plant.source !== 'user') {
    return null;
  }

  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link to={`/dashboard/plants/${plant.plantLibraryId}/edit`}>
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Edit
        </Link>
      </Button>
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="plantLibraryId" value={plant.plantLibraryId} />
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

function createPlantResourceUrl({ search, offset }: { search: string; offset: number }) {
  const params = new URLSearchParams({
    limit: String(plantPageSize),
    offset: String(offset),
  });
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set('search', trimmedSearch);
  }

  return `/resources/plant-library?${params.toString()}`;
}

function formatNeed(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSun(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getToast(value: string | null): ToastData | null {
  switch (value) {
    case 'plant-created':
      return {
        type: 'success',
        message: 'Plant added to your library.',
      };
    case 'plant-updated':
      return {
        type: 'success',
        message: 'Plant changes saved.',
      };
    case 'plant-deleted':
      return {
        type: 'success',
        message: 'Plant removed from your library.',
      };
    default:
      return null;
  }
}
