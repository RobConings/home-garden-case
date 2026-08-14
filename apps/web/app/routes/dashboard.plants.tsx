import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { PageContainer, PageRow, PageStack } from '@/components/layout';
import { EmptyState, GeneralList, PageTitle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlantLibraryEntry,
  deletePlantLibraryEntry,
  getPlantLibraryEntry,
  getPlantLibraryPage,
  type PlantLibraryEntry,
  type PlantLibraryPage,
  updatePlantLibraryEntry,
} from '@/features/plants/api';
import { PlantLibraryForm } from '@/features/plants/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

type ActionData = {
  error?: string;
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
  const plantPage = await getPlantLibraryPage(user.userId, {
    limit: plantPageSize,
    offset: 0,
  });
  const url = new URL(request.url);
  const isCreating = url.searchParams.get('new') === '1';
  const editParam = url.searchParams.get('edit');
  const editId = editParam ? Number(editParam) : Number.NaN;
  const editPlant = Number.isFinite(editId)
    ? await getEditablePlant(user.userId, editId)
    : null;

  return { user, plantPage, editPlant, isCreating };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = String(formData.get('intent') || '');

  try {
    if (intent === 'delete') {
      const plantLibraryId = Number(formData.get('plantLibraryId'));
      await deletePlantLibraryEntry(plantLibraryId, user.userId);

      return redirect('/dashboard/plants');
    }

    const payload = readPlantPayload(formData);

    if (intent === 'update') {
      const plantLibraryId = Number(formData.get('plantLibraryId'));
      await updatePlantLibraryEntry(plantLibraryId, user.userId, payload);

      return redirect('/dashboard/plants');
    }

    await createPlantLibraryEntry({
      ...payload,
      ownerUserId: user.userId,
    });

    return redirect('/dashboard/plants');
  } catch (error) {
    if (error instanceof ApiClientError) {
      return json<ActionData>(
        {
          error: error.status === 400 ? 'Check the plant details and try again.' : error.message,
        },
        { status: error.status },
      );
    }

    return json<ActionData>(
      {
        error: 'We could not save this plant right now.',
      },
      { status: 503 },
    );
  }
}

export default function DashboardPlants() {
  const { plantPage, editPlant, isCreating } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const plantFetcher = useFetcher<PlantLibraryResourceData>();
  const initialSearchSkipped = useRef(false);
  const [query, setQuery] = useState('');
  const [plants, setPlants] = useState(plantPage.items);
  const [hasMore, setHasMore] = useState(plantPage.hasMore);
  const isSubmitting = navigation.state === 'submitting';
  const isLoadingPlants = plantFetcher.state !== 'idle';
  const showForm = isCreating || Boolean(editPlant);

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
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Plant library"
          title="Plants"
          description="Choose from common plants or add your own care profile."
          actions={
            showForm ? (
              <Button asChild variant="secondary">
                <Link to="/dashboard/plants">Cancel</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/dashboard/plants?new=1">Add new plant</Link>
              </Button>
            )
          }
        />

        {actionData?.error ? (
          <p className="rounded-md border border-[var(--rootly-danger)]/25 bg-[var(--rootly-danger-soft)] px-3 py-2 text-sm text-[var(--rootly-danger)]">
            {actionData.error}
          </p>
        ) : null}

        {showForm ? (
          <PlantLibraryForm
            key={editPlant?.plantLibraryId ?? 'create'}
            as={Form}
            plant={editPlant ?? undefined}
            isSubmitting={isSubmitting}
          />
        ) : null}

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
              key: 'source',
              label: 'Source',
              render: (plant) => (
                <Badge variant={plant.source === 'system' ? 'neutral' : 'success'}>
                  {plant.source === 'system' ? 'Seeded' : 'Custom'}
                </Badge>
              ),
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
        <Link to={`/dashboard/plants?edit=${plant.plantLibraryId}`}>
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

async function getEditablePlant(userId: number, plantLibraryId: number) {
  try {
    const plant = await getPlantLibraryEntry(plantLibraryId, userId);
    return plant.source === 'user' ? plant : null;
  } catch {
    return null;
  }
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
