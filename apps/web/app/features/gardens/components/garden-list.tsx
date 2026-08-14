import { Form, Link } from '@remix-run/react';
import { Map, Pencil, Trash2 } from 'lucide-react';
import { PageRow } from '@/components/layout';
import { EmptyState, GeneralList } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Garden } from '@/features/gardens/api';

type GardenListProps = {
  gardens: Garden[];
};

export function GardenList({ gardens }: GardenListProps) {
  return (
    <GeneralList
      items={gardens}
      getKey={(garden) => garden.gardenId}
      getSearchText={(garden) =>
        [
          garden.gardenName,
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
          className: 'w-56 text-right',
          render: (garden) => <GardenActions garden={garden} />,
        },
      ]}
    />
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
          <span className="font-medium text-[var(--rootly-text)]">Dimensions:</span>{' '}
          {garden.totalWidth} x {garden.totalHeight} m
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Growing area:</span>{' '}
          {formatArea(garden.totalSurfaceArea)} m2
        </p>
        <p>
          <span className="font-medium text-[var(--rootly-text)]">Grid:</span> {garden.gridSizeCm}{' '}
          cm
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
      <Button asChild variant="subtle" size="sm">
        <Link to={`/dashboard/gardens/${garden.gardenId}/editor`}>
          <Map aria-hidden="true" className="h-3.5 w-3.5" />
          Editor
        </Link>
      </Button>
      <Button asChild variant="secondary" size="sm">
        <Link to={`/dashboard/gardens/${garden.gardenId}/edit`}>
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

function formatSunDirection(value: Garden['sunDirection']) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatArea(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
