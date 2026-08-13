import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Backyard beds',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Number: Story = {
  args: {
    type: 'number',
    defaultValue: 24,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled field',
  },
};
