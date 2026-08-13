import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/shared/field';

const meta = {
  title: 'Shared/Field',
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {
  render: () => (
    <Field id="surface" label="Total surface area" description="Measured in square meters.">
      <Input id="surface" type="number" placeholder="24" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field id="surface-error" label="Total surface area" error="Surface area must be greater than 0.">
      <Input id="surface-error" type="number" defaultValue={0} />
    </Field>
  ),
};
