import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: {
    children: 'Healthy',
    variant: 'success',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutral</Badge>
      <Badge variant="success">Healthy</Badge>
      <Badge variant="warning">Needs water</Badge>
      <Badge variant="danger">Over capacity</Badge>
      <Badge variant="info">Scheduled</Badge>
    </div>
  ),
};
