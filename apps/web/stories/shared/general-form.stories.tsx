import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContentSection } from '@/components/layout/content-section';
import { PageDivider } from '@/components/layout/page-divider';
import { PageRow } from '@/components/layout/page-row';
import { PageStack } from '@/components/layout/page-stack';
import { EmptyState } from '@/components/shared/empty-state';
import { Field } from '@/components/shared/field';
import { GeneralForm } from '@/components/shared/general-form';

type GardenDraft = {
  name: string;
  totalSurfaceArea: number;
  plantType: 'vegetable' | 'fruit' | 'flower';
  location: string;
  hasCoordinates: boolean;
  latitude: string;
  longitude: string;
};

const initialDraft: GardenDraft = {
  name: 'Backyard beds',
  totalSurfaceArea: 24,
  plantType: 'vegetable',
  location: 'South-facing raised beds near the terrace',
  hasCoordinates: false,
  latitude: '',
  longitude: '',
};

function GardenFormPreview({ draft, saved }: { draft: GardenDraft; saved: boolean }) {
  const usedArea = draft.plantType === 'flower' ? 9 : draft.plantType === 'fruit' ? 12 : 16;
  const availableArea = Math.max(0, draft.totalSurfaceArea - usedArea);
  const usage = draft.totalSurfaceArea > 0 ? (usedArea / draft.totalSurfaceArea) * 100 : 0;

  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{draft.name || 'Untitled garden'}</CardTitle>
          <Badge variant={saved ? 'success' : 'warning'}>{saved ? 'Saved' : 'Draft'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 text-sm text-slate-600">
          <PageRow align="between" gap="sm">
            <span>Total area</span>
            <strong className="text-slate-950">{draft.totalSurfaceArea || 0}m2</strong>
          </PageRow>
          <PageRow align="between" gap="sm">
            <span>Available</span>
            <strong className="text-slate-950">{availableArea}m2</strong>
          </PageRow>
          <PageRow align="between" gap="sm">
            <span>Primary use</span>
            <Badge>{draft.plantType}</Badge>
          </PageRow>
        </div>
        <Progress value={usage} max={100} />
        <p className="text-sm leading-6 text-slate-600">
          {draft.location || 'No location notes yet.'}
        </p>
      </CardContent>
    </Card>
  );
}

function InteractiveGardenForm() {
  const [draft, setDraft] = useState<GardenDraft>(initialDraft);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const errors = useMemo(
    () => ({
      name: draft.name.trim().length === 0 ? 'Garden name is required.' : '',
      totalSurfaceArea:
        draft.totalSurfaceArea <= 0 ? 'Surface area must be greater than 0 square meters.' : '',
      coordinates:
        draft.hasCoordinates && (!draft.latitude || !draft.longitude)
          ? 'Latitude and longitude must be provided together.'
          : '',
    }),
    [draft],
  );

  const isValid = !errors.name && !errors.totalSurfaceArea && !errors.coordinates;

  function saveGarden() {
    setIsSaving(true);
    setSaved(false);
    window.setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
    }, 700);
  }

  return (
    <ContentSection layout="rightSidebar" gap="lg" className="w-[960px]">
      <GeneralForm
        title="Create garden"
        description="Validation, animated advanced fields, live preview, and fake saving state."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(initialDraft);
                setSaved(false);
                setShowAdvanced(false);
              }}
            >
              Reset
            </Button>
            <Button type="button" disabled={!isValid || isSaving} onClick={saveGarden}>
              {isSaving ? 'Saving...' : 'Save garden'}
            </Button>
          </>
        }
      >
        <Field id="garden-name" label="Garden name" error={errors.name}>
          <Input
            id="garden-name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </Field>
        <ContentSection layout="twoColumn" gap="md">
          <Field id="surface" label="Total surface area" error={errors.totalSurfaceArea}>
            <Input
              id="surface"
              type="number"
              min={0}
              value={draft.totalSurfaceArea}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  totalSurfaceArea: Number(event.target.value),
                }))
              }
            />
          </Field>
          <Field id="plant-type" label="Primary plant type">
            <Select
              id="plant-type"
              value={draft.plantType}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  plantType: event.target.value as GardenDraft['plantType'],
                }))
              }
            >
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="flower">Flower</option>
            </Select>
          </Field>
        </ContentSection>
        <Field id="location" label="Location description">
          <Textarea
            id="location"
            value={draft.location}
            onChange={(event) =>
              setDraft((current) => ({ ...current, location: event.target.value }))
            }
          />
        </Field>
        <PageDivider />
        <PageRow align="between" gap="sm">
          <div>
            <p className="text-sm font-medium text-slate-950">Advanced location</p>
            <p className="text-sm text-slate-500">Coordinates are optional, but must be paired.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant={showAdvanced ? 'primary' : 'secondary'}
            onClick={() => {
              setShowAdvanced((value) => !value);
              setDraft((current) => ({ ...current, hasCoordinates: !showAdvanced }));
            }}
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </Button>
        </PageRow>
        <div
          className={[
            'grid overflow-hidden transition-all duration-300 ease-out',
            showAdvanced ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
        >
          <div className="min-h-0">
            <ContentSection layout="twoColumn" gap="md" className="pt-1">
              <Field id="latitude" label="Latitude">
                <Input
                  id="latitude"
                  value={draft.latitude}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, latitude: event.target.value }))
                  }
                />
              </Field>
              <Field id="longitude" label="Longitude" error={errors.coordinates}>
                <Input
                  id="longitude"
                  value={draft.longitude}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, longitude: event.target.value }))
                  }
                />
              </Field>
            </ContentSection>
          </div>
        </div>
      </GeneralForm>
      <PageStack gap="md">
        <GardenFormPreview draft={draft} saved={saved} />
        <EmptyState
          title="Next component target"
          description="This can become a feature-scoped garden form when we start route pages."
          action={<Button variant="secondary">Feature later</Button>}
        />
      </PageStack>
    </ContentSection>
  );
}

const meta = {
  title: 'Shared/GeneralForm',
  component: GeneralForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GeneralForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <GeneralForm
      title="Create garden"
      description="Define the available growing space before adding plants."
      footer={<Button type="submit">Save garden</Button>}
      className="w-[520px]"
    >
      <Field id="name" label="Garden name">
        <Input id="name" placeholder="Backyard beds" />
      </Field>
      <Field id="surface" label="Total surface area" description="Measured in square meters.">
        <Input id="surface" type="number" placeholder="24" />
      </Field>
    </GeneralForm>
  ),
};

export const Interactive: Story = {
  render: () => <InteractiveGardenForm />,
};
