import { Form, Link, useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { PageRow } from '@/components/layout';
import { EmptyState, GeneralList } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlantLibraryEntry, PlantLibraryPage } from '@/features/plants/api';

type PlantLibraryListProps = {
  initialPage: PlantLibraryPage;
};

type PlantLibraryResourceData = PlantLibraryPage & {
  search: string;
};

const plantPageSize = 12;

export function PlantLibraryList({ initialPage }: PlantLibraryListProps) {
  const plantFetcher = useFetcher<PlantLibraryResourceData>();
  const initialSearchSkipped = useRef(false);
  const [query, setQuery] = useState('');
  const [plants, setPlants] = useState(initialPage.items);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const isLoadingPlants = plantFetcher.state !== 'idle';

  useEffect(() => {
    setPlants(initialPage.items);
    setHasMore(initialPage.hasMore);
  }, [initialPage.hasMore, initialPage.items]);

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
  }, [plantFetcher, query]);

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
