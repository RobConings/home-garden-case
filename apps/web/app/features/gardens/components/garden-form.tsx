import type { ElementType } from 'react';
import { PageGrid } from '@/components/layout';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Garden } from '@/features/gardens/api';

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

      <PageGrid columns={2} gap="sm">
        <Field id="gardenName" label="Name">
          <Input
            id="gardenName"
            name="gardenName"
            defaultValue={garden?.gardenName}
            placeholder="Kitchen garden"
            required
          />
        </Field>
        <Field id="locationDescription" label="Postal code">
          <Input
            id="locationDescription"
            name="locationDescription"
            defaultValue={garden?.locationDescription ?? ''}
            placeholder="1000"
            inputMode="numeric"
            autoComplete="postal-code"
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
    </GeneralForm>
  );
}
