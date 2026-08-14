import {
  CalendarClock,
  Droplets,
  Leaf,
  Sun,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { PageContainer, PageGrid, PageStack } from '@/components/layout';
import { PageTitle, StatCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type CareStatus = 'on_track' | 'due_today' | 'watch';

type CarePlant = {
  id: number;
  name: string;
  location: string;
  waterEveryDays: number;
  nextWatering: string;
  lastWatered: string;
  sunHours: number;
  recommendedSunHours: number;
  nutrition: {
    nextApplication: string;
    frequency: string;
    recommendation: string;
  };
  status: CareStatus;
};

const carePlants: CarePlant[] = [
  {
    id: 1,
    name: 'Tomato',
    location: 'Raised bed A',
    waterEveryDays: 2,
    nextWatering: 'Today',
    lastWatered: '2 days ago',
    sunHours: 7.5,
    recommendedSunHours: 8,
    nutrition: {
      nextApplication: 'In 5 days',
      frequency: 'Every 14 days',
      recommendation: 'Balanced vegetable feed, moderate dose',
    },
    status: 'due_today',
  },
  {
    id: 2,
    name: 'Basil',
    location: 'Herb border',
    waterEveryDays: 3,
    nextWatering: 'Tomorrow',
    lastWatered: '2 days ago',
    sunHours: 5.5,
    recommendedSunHours: 6,
    nutrition: {
      nextApplication: 'In 12 days',
      frequency: 'Every 21 days',
      recommendation: 'Light liquid feed after harvest',
    },
    status: 'on_track',
  },
  {
    id: 3,
    name: 'Lettuce',
    location: 'Cool bed',
    waterEveryDays: 1,
    nextWatering: 'Today',
    lastWatered: 'Yesterday',
    sunHours: 3.5,
    recommendedSunHours: 4,
    nutrition: {
      nextApplication: 'In 9 days',
      frequency: 'Every 21 days',
      recommendation: 'Low nitrogen refresh, light dose',
    },
    status: 'due_today',
  },
  {
    id: 4,
    name: 'Pepper',
    location: 'Raised bed B',
    waterEveryDays: 2,
    nextWatering: 'In 2 days',
    lastWatered: 'Today',
    sunHours: 5,
    recommendedSunHours: 8,
    nutrition: {
      nextApplication: 'Tomorrow',
      frequency: 'Every 14 days',
      recommendation: 'Potassium-rich vegetable feed',
    },
    status: 'watch',
  },
];

const careSchedule = [
  {
    time: 'Today',
    title: 'Water tomatoes and lettuce',
    description: 'Keep soil evenly moist without soaking the root zone.',
    icon: Droplets,
    tone: 'water',
  },
  {
    time: 'Tomorrow',
    title: 'Feed peppers',
    description: 'Apply potassium-rich feed around the base, then water in.',
    icon: Leaf,
    tone: 'nutrition',
  },
  {
    time: 'This week',
    title: 'Review basil sun exposure',
    description: 'Current light is close to target; keep nearby plants trimmed.',
    icon: Sun,
    tone: 'sun',
  },
];

export function CareOverview() {
  const dueToday = carePlants.filter((plant) => plant.nextWatering === 'Today').length;
  const averageSun =
    carePlants.reduce((total, plant) => total + plant.sunHours, 0) / carePlants.length;
  const nutritionDue = carePlants.filter(
    (plant) => plant.nutrition.nextApplication === 'Tomorrow',
  ).length;
  const needsAttention = carePlants.filter((plant) => plant.status === 'watch').length;

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Care"
          title="Care plan"
          description="Track watering rhythm, sunlight fit, and nutrition timing for the plants in your garden."
        />

        <PageGrid columns={4} gap="sm">
          <StatCard
            label="Water today"
            value={dueToday}
            description="Plants due"
            icon={Droplets}
          />
          <StatCard
            label="Average sun"
            value={`${averageSun.toFixed(1)} h`}
            description="Across tracked plants"
            icon={Sun}
          />
          <StatCard
            label="Nutrition"
            value={nutritionDue}
            description="Due tomorrow"
            icon={Leaf}
          />
          <StatCard
            label="Needs review"
            value={needsAttention}
            description="Below target"
            icon={TriangleAlert}
          />
        </PageGrid>

        <PageGrid layout="rightSidebar" gap="md" align="start">
          <section className="grid gap-4 lg:[grid-area:main]">
            {carePlants.map((plant) => (
              <PlantCareCard key={plant.id} plant={plant} />
            ))}
          </section>

          <aside className="grid gap-4 lg:[grid-area:sidebar]">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming care</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {careSchedule.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="grid gap-2 border-l-2 border-[var(--rootly-border)] pl-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--rootly-text-muted)]">
                          {item.time}
                        </span>
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            'h-4 w-4',
                            item.tone === 'water' && 'text-sky-700',
                            item.tone === 'nutrition' && 'text-[var(--rootly-primary)]',
                            item.tone === 'sun' && 'text-[var(--rootly-accent)]',
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--rootly-text)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--rootly-text-muted)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care rhythm</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-[var(--rootly-text-muted)]">
                <CareRhythmRow label="Morning" value="Water check" />
                <CareRhythmRow label="Midday" value="Sun exposure review" />
                <CareRhythmRow label="Weekly" value="Nutrition and growth check" />
              </CardContent>
            </Card>
          </aside>
        </PageGrid>
      </PageStack>
    </PageContainer>
  );
}

function PlantCareCard({ plant }: { plant: CarePlant }) {
  const sunPercentage = Math.min(100, (plant.sunHours / plant.recommendedSunHours) * 100);
  const sunGap = plant.recommendedSunHours - plant.sunHours;

  return (
    <Card>
      <CardContent className="grid gap-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--rootly-text)]">{plant.name}</h2>
              <CareStatusBadge status={plant.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--rootly-text-muted)]">{plant.location}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--rootly-text-muted)]">
            <CalendarClock aria-hidden="true" className="h-4 w-4" />
            {plant.nextWatering}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <CareMetric
            icon={Droplets}
            label="Water"
            value={`Every ${plant.waterEveryDays} day${plant.waterEveryDays === 1 ? '' : 's'}`}
            detail={`Last watered ${plant.lastWatered}`}
          />
          <CareMetric
            icon={Sun}
            label="Sun"
            value={`${plant.sunHours} h observed`}
            detail={`${plant.recommendedSunHours} h recommended`}
          />
          <CareMetric
            icon={Leaf}
            label="Nutrition"
            value={plant.nutrition.nextApplication}
            detail={plant.nutrition.frequency}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-[var(--rootly-text)]">Sun fit</span>
            <span className="text-[var(--rootly-text-muted)]">
              {sunGap <= 0 ? 'Meets target' : `${sunGap.toFixed(1)} h short`}
            </span>
          </div>
          <Progress value={sunPercentage} />
          <p className="text-sm leading-6 text-[var(--rootly-text-muted)]">
            {plant.nutrition.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CareMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface-muted)] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--rootly-text-muted)]">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </div>
      <p className="text-base font-semibold text-[var(--rootly-text)]">{value}</p>
      <p className="text-sm text-[var(--rootly-text-muted)]">{detail}</p>
    </div>
  );
}

function CareStatusBadge({ status }: { status: CareStatus }) {
  switch (status) {
    case 'due_today':
      return <Badge variant="warning">Due today</Badge>;
    case 'watch':
      return <Badge variant="danger">Review</Badge>;
    default:
      return <Badge variant="success">On track</Badge>;
  }
}

function CareRhythmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--rootly-border)] pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-[var(--rootly-text)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
