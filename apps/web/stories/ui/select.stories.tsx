import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '@/components/ui/select';

const meta = {
  title: 'UI/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PlantType: Story = {
  render: () => (
    <div className="w-[320px]">
      <Select defaultValue="vegetable">
        <option value="vegetable">Vegetable</option>
        <option value="fruit">Fruit</option>
        <option value="flower">Flower</option>
      </Select>
    </div>
  ),
};
