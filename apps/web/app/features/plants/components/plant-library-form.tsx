import type { ElementType } from 'react';
import type { PlantLibraryEntry } from '@/features/plants/api';
import { PageGrid } from '@/components/layout';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type PlantLibraryFormProps = {
  plant?: PlantLibraryEntry;
  isSubmitting?: boolean;
  as?: ElementType;
};

export function PlantLibraryForm({
  plant,
  isSubmitting = false,
  as: FormComponent = 'form',
}: PlantLibraryFormProps) {
  const isEditing = Boolean(plant);

  return (
    <GeneralForm
      as={FormComponent}
      method="post"
      title={isEditing ? 'Edit custom plant' : 'Add new plant'}
      description="Save plants you grow often with their care preferences."
      footer={
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Save plant' : 'Add plant'}
        </Button>
      }
    >
      <input type="hidden" name="intent" value={isEditing ? 'update' : 'create'} />
      {plant ? <input type="hidden" name="plantLibraryId" value={plant.plantLibraryId} /> : null}

      <PageGrid columns={2} gap="sm">
        <Field id="commonName" label="Name">
          <Input
            id="commonName"
            name="commonName"
            defaultValue={plant?.commonName}
            placeholder="Cherry tomato"
            required
          />
        </Field>
        <Field id="botanicalName" label="Botanical name">
          <Input
            id="botanicalName"
            name="botanicalName"
            defaultValue={plant?.botanicalName ?? ''}
            placeholder="Solanum lycopersicum"
          />
        </Field>
      </PageGrid>

      <PageGrid columns={3} gap="sm">
        <Field id="plantCategory" label="Type">
          <Select
            id="plantCategory"
            name="plantCategory"
            defaultValue={plant?.plantCategory ?? 'vegetable'}
          >
            <option value="vegetable">Vegetable</option>
            <option value="fruit">Fruit</option>
            <option value="herb">Herb</option>
            <option value="flower">Flower</option>
          </Select>
        </Field>
        <Field id="waterNeed" label="Water">
          <Select id="waterNeed" name="waterNeed" defaultValue={plant?.waterNeed ?? 'moderate'}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </Select>
        </Field>
        <Field id="sunNeed" label="Sun">
          <Select id="sunNeed" name="sunNeed" defaultValue={plant?.sunNeed ?? 'full_sun'}>
            <option value="full_sun">Full sun</option>
            <option value="partial_sun">Partial sun</option>
            <option value="partial_shade">Partial shade</option>
          </Select>
        </Field>
      </PageGrid>

      <PageGrid columns={3} gap="sm">
        <Field id="nutritionNeed" label="Nutrition">
          <Select
            id="nutritionNeed"
            name="nutritionNeed"
            defaultValue={plant?.nutritionNeed ?? 'moderate'}
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </Select>
        </Field>
        <Field id="spacingCm" label="Spacing cm">
          <Input
            id="spacingCm"
            name="spacingCm"
            type="number"
            min="1"
            defaultValue={plant?.spacingCm ?? ''}
          />
        </Field>
        <Field id="daysToMaturity" label="Days to maturity">
          <Input
            id="daysToMaturity"
            name="daysToMaturity"
            type="number"
            min="1"
            defaultValue={plant?.daysToMaturity ?? ''}
          />
        </Field>
      </PageGrid>

      <Field id="waterNotes" label="Water notes">
        <Textarea
          id="waterNotes"
          name="waterNotes"
          defaultValue={plant?.waterNotes}
          placeholder="Keep soil evenly moist."
        />
      </Field>
      <Field id="sunNotes" label="Sun notes">
        <Textarea
          id="sunNotes"
          name="sunNotes"
          defaultValue={plant?.sunNotes}
          placeholder="Needs at least 6 hours of direct sun."
        />
      </Field>
      <Field id="nutritionNotes" label="Nutrition notes">
        <Textarea
          id="nutritionNotes"
          name="nutritionNotes"
          defaultValue={plant?.nutritionNotes}
          placeholder="Feed after flowering starts."
        />
      </Field>
      <Field id="plantingNotes" label="Planting notes">
        <Textarea
          id="plantingNotes"
          name="plantingNotes"
          defaultValue={plant?.plantingNotes}
          placeholder="Stake early and mulch after planting."
        />
      </Field>
    </GeneralForm>
  );
}
