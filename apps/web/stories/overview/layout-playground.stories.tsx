import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/shared/stat-card';
import { BrandMark } from '@/components/shared/brand-mark';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { AppShell } from '@/components/layout/app-shell';
import { ContentSection } from '@/components/layout/content-section';
import { PageContainer } from '@/components/layout/page-container';
import { PageDivider } from '@/components/layout/page-divider';
import { PageGrid } from '@/components/layout/page-grid';
import { PageRow } from '@/components/layout/page-row';
import { PageSection } from '@/components/layout/page-section';
import { PageStack } from '@/components/layout/page-stack';
import { Flower2, Leaf, Sprout } from 'lucide-react';

type GridLayout = 'oneColumn' | 'twoColumn' | 'threeColumn' | 'leftSidebar' | 'rightSidebar';
type ContentLayout =
  | 'oneColumn'
  | 'twoColumn'
  | 'threeColumn'
  | 'fourColumn'
  | 'leftSidebar'
  | 'rightSidebar';
type Density = 'compact' | 'comfortable' | 'spacious';

const gridLayouts: GridLayout[] = [
  'oneColumn',
  'twoColumn',
  'threeColumn',
  'leftSidebar',
  'rightSidebar',
];

const contentLayouts: ContentLayout[] = [
  'oneColumn',
  'twoColumn',
  'threeColumn',
  'fourColumn',
  'leftSidebar',
  'rightSidebar',
];

const densities: Density[] = ['compact', 'comfortable', 'spacious'];

const densityConfig = {
  compact: {
    gridGap: 'sm' as const,
    contentGap: 'sm' as const,
    sectionSpacing: 'sm' as const,
  },
  comfortable: {
    gridGap: 'md' as const,
    contentGap: 'md' as const,
    sectionSpacing: 'md' as const,
  },
  spacious: {
    gridGap: 'lg' as const,
    contentGap: 'lg' as const,
    sectionSpacing: 'lg' as const,
  },
};

function titleize(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function OptionButtons<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <PageStack gap="sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <PageRow gap="sm">
        {options.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={value === option ? 'primary' : 'secondary'}
            onClick={() => onChange(option)}
          >
            {titleize(option)}
          </Button>
        ))}
      </PageRow>
    </PageStack>
  );
}

function DemoCard({
  title,
  description,
  tone = 'neutral',
}: {
  title: string;
  description: string;
  tone?: 'neutral' | 'success' | 'warning';
}) {
  const badgeVariant = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'neutral';

  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant={badgeVariant}>{titleize(tone)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function GardenSummary() {
  return (
    <ContentSection layout="threeColumn" gap="sm">
      <StatCard label="Gardens" value={3} description="2 active this season" icon={Sprout} />
      <StatCard label="Plants" value={24} description="16 vegetables" icon={Leaf} trend="+4" />
      <StatCard label="Flowers" value={8} description="Pollinator friendly" icon={Flower2} />
    </ContentSection>
  );
}

function GardenPlanningContent({
  contentLayout,
  density,
}: {
  contentLayout: ContentLayout;
  density: Density;
}) {
  const config = densityConfig[density];

  return (
    <PageStack gap={config.contentGap}>
      <GardenSummary />
      <ContentSection layout={contentLayout} gap={config.contentGap}>
        <DemoCard
          title="Capacity"
          tone="success"
          description="The main garden has 16 of 24 square meters assigned. The next plant can use up to 8 square meters."
        />
        <DemoCard
          title="Planting schedule"
          description="Tomatoes and strawberries are planned first. Herbs are held back until the north bed is ready."
        />
        <DemoCard
          title="Risk"
          tone="warning"
          description="Humidity targets differ strongly between lavender and vegetables, so they should be grouped separately."
        />
        <DemoCard
          title="Notes"
          description="This content section can switch between one, two, three, four, or sidebar layouts independently."
        />
      </ContentSection>
      <Card>
        <CardHeader>
          <CardTitle>Used growing space</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PageRow align="between" gap="sm">
            <span className="text-sm text-slate-600">16m2 used</span>
            <span className="text-sm font-medium text-slate-950">67%</span>
          </PageRow>
          <Progress value={16} max={24} />
        </CardContent>
      </Card>
    </PageStack>
  );
}

function LayoutPlayground() {
  const [gridLayout, setGridLayout] = useState<GridLayout>('rightSidebar');
  const [contentLayout, setContentLayout] = useState<ContentLayout>('twoColumn');
  const [density, setDensity] = useState<Density>('comfortable');
  const [showTop, setShowTop] = useState(true);
  const [showBottom, setShowBottom] = useState(true);

  const config = densityConfig[density];
  const hasSidebar = gridLayout === 'leftSidebar' || gridLayout === 'rightSidebar';
  const hasColumns = gridLayout === 'twoColumn' || gridLayout === 'threeColumn';

  return (
    <PageContainer size="full" className="bg-slate-50">
      <PageStack gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Layout playground</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentSection layout="threeColumn" gap="md">
              <OptionButtons
                label="Page grid"
                value={gridLayout}
                options={gridLayouts}
                onChange={setGridLayout}
              />
              <OptionButtons
                label="Content layout"
                value={contentLayout}
                options={contentLayouts}
                onChange={setContentLayout}
              />
              <OptionButtons
                label="Density"
                value={density}
                options={densities}
                onChange={setDensity}
              />
            </ContentSection>
            <PageDivider className="my-5" />
            <PageRow gap="sm">
              <Button
                size="sm"
                variant={showTop ? 'primary' : 'secondary'}
                onClick={() => setShowTop((value) => !value)}
              >
                Toggle top
              </Button>
              <Button
                size="sm"
                variant={showBottom ? 'primary' : 'secondary'}
                onClick={() => setShowBottom((value) => !value)}
              >
                Toggle bottom
              </Button>
            </PageRow>
          </CardContent>
        </Card>

        <PageGrid layout={gridLayout} gap={config.gridGap}>
          {showTop ? (
            <PageSection
              slot="top"
              spacing={config.sectionSpacing}
              title="Garden planner workspace"
              description="The outer PageGrid controls page regions. The nested ContentSection controls the composition inside the main area."
              actions={<Button size="sm">Create garden</Button>}
            />
          ) : null}

          <PageSection
            slot={hasColumns ? 'column1' : 'main'}
            spacing={config.sectionSpacing}
            className="transition-all duration-300"
          >
            <GardenPlanningContent contentLayout={contentLayout} density={density} />
          </PageSection>

          {hasColumns ? (
            <>
              <PageSection slot="column2" spacing={config.sectionSpacing}>
                <DemoCard
                  title="Second column"
                  description="Column layouts can keep supporting content next to the main planning content."
                />
              </PageSection>
              {gridLayout === 'threeColumn' ? (
                <PageSection slot="column3" spacing={config.sectionSpacing}>
                  <DemoCard
                    title="Third column"
                    tone="warning"
                    description="Use this only when the page has enough structured information to justify it."
                  />
                </PageSection>
              ) : null}
            </>
          ) : null}

          {hasSidebar ? (
            <PageSection slot="sidebar" spacing={config.sectionSpacing}>
              <PageStack gap="md">
                <DemoCard
                  title="Context panel"
                  description="Sidebar layouts work for filters, summaries, help text, or unsaved-change previews."
                />
                <DemoCard
                  title="Next action"
                  tone="success"
                  description="Add a plant to test the API capacity rule once the feature screens exist."
                />
              </PageStack>
            </PageSection>
          ) : null}

          {showBottom ? (
            <PageSection slot="bottom" spacing={config.sectionSpacing}>
              <Card>
                <CardContent className="p-4">
                  <PageRow align="between">
                    <span className="text-sm text-slate-600">
                      Current setup: {titleize(gridLayout)} / {titleize(contentLayout)} /{' '}
                      {titleize(density)}
                    </span>
                    <Badge variant="info">Responsive</Badge>
                  </PageRow>
                </CardContent>
              </Card>
            </PageSection>
          ) : null}
        </PageGrid>
      </PageStack>
    </PageContainer>
  );
}

const meta = {
  title: 'Overview/Layout Playground',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => <LayoutPlayground />,
};

export const DashboardLayout: Story = {
  render: () => (
    <AppShell
      header={
        <PageContainer className="flex h-16 items-center justify-between py-0">
          <BrandMark compact />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm">Add garden</Button>
          </div>
        </PageContainer>
      }
      sidebar={
        <nav className="grid gap-1 p-4 text-sm text-slate-600">
          <span className="rounded-md bg-emerald-50 px-3 py-2 font-medium text-emerald-900">
            Dashboard
          </span>
          <span className="px-3 py-2">Gardens</span>
          <span className="px-3 py-2">Plants</span>
        </nav>
      }
    >
      <PageContainer>
        <PageSection
          slot="top"
          eyebrow="Planner"
          title="Garden dashboard"
          description="Track garden capacity, plants, and upcoming planting work."
          actions={<Button variant="secondary">Export</Button>}
        >
          <PageGrid columns={3}>
            {['Gardens', 'Plants', 'Used space'].map((item) => (
              <Card key={item}>
                <CardHeader>
                  <CardTitle>{item}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-slate-950">12</p>
                </CardContent>
              </Card>
            ))}
          </PageGrid>
        </PageSection>
      </PageContainer>
    </AppShell>
  ),
};
