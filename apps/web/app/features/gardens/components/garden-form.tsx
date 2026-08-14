import type { ElementType } from 'react';
import { Info } from 'lucide-react';
import { PageGrid } from '@/components/layout';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Garden } from '@/features/gardens/api';
import { textLimits } from '@/lib/plain-text';

type GardenFormProps = {
  garden?: Garden;
  isSubmitting?: boolean;
  as?: ElementType;
};

export function GardenForm({
  garden,
  isSubmitting = false,
  as: FormComponent = 'form',
}: GardenFormProps) {
  const isEditing = Boolean(garden);

  return (
    <GeneralForm
      as={FormComponent}
      method="post"
      title={isEditing ? 'Edit garden' : 'Add new garden'}
      description="Save the core garden dimensions and orientation."
      footer={
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Save garden' : 'Add garden'}
        </Button>
      }
    >
      <input type="hidden" name="intent" value={isEditing ? 'update' : 'create'} />
      {garden ? <input type="hidden" name="gardenId" value={garden.gardenId} /> : null}

      <PageGrid columns={1} gap="sm">
        <Field id="gardenName" label="Name">
          <Input
            id="gardenName"
            name="gardenName"
            defaultValue={garden?.gardenName}
            maxLength={textLimits.name}
            placeholder="Home garden"
            required
          />
        </Field>
      </PageGrid>

      <PageGrid columns={3} gap="sm">
        <Field id="totalWidth" label="Total width (m)">
          <Input
            id="totalWidth"
            name="totalWidth"
            type="number"
            min="0.1"
            step="0.1"
            defaultValue={garden?.totalWidth ?? ''}
            readOnly={isEditing}
            required
          />
        </Field>
        <Field id="totalHeight" label="Total height (m)">
          <Input
            id="totalHeight"
            name="totalHeight"
            type="number"
            min="0.1"
            step="0.1"
            defaultValue={garden?.totalHeight ?? ''}
            readOnly={isEditing}
            required
          />
        </Field>
        <Field id="sunDirection" label="Sun direction">
          <Select
            id="sunDirection"
            name="sunDirection"
            defaultValue={garden?.sunDirection ?? 'south'}
            required
          >
            <option value="north">North</option>
            <option value="east">East</option>
            <option value="south">South</option>
            <option value="west">West</option>
          </Select>
        </Field>
      </PageGrid>

      <Field id="gridSizeCm" label="Grid size (cm)">
        <Input
          id="gridSizeCm"
          name="gridSizeCm"
          type="number"
          min="5"
          step="5"
          defaultValue={garden?.gridSizeCm ?? 25}
          readOnly={isEditing}
          required
        />
      </Field>

      <div className="flex gap-3 rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface-muted)] p-4 text-sm leading-6 text-[var(--rootly-text-muted)]">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rootly-primary)]" />
        <div>
          <p className="font-medium text-[var(--rootly-text)]">Editor grid settings</p>
          <p className="mt-1">
            Total width, total height, and grid size are set when the garden is created because they
            define the editor grid. These values cannot be adjusted later.
          </p>
        </div>
      </div>
    </GeneralForm>
  );
}
