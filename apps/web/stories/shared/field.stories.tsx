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
  args: {
    id: 'surface',
    label: 'Total surface area',
    description: 'Measured in square meters.',
    children: <Input id="surface" type="number" placeholder="24" />,
  },
};

export const WithError: Story = {
  args: {
    id: 'surface-error',
    label: 'Total surface area',
    error: 'Surface area must be greater than 0.',
    children: <Input id="surface-error" type="number" defaultValue={0} />,
  },
};
