import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const meta = {
  title: 'Shared/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
