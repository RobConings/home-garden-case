import type { Meta, StoryObj } from '@storybook/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  args: {
    title: 'No gardens yet',
    description: 'Create your first garden to start planning plants and tracking available space.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <Button>
        <Plus className="h-4 w-4" />
        Create garden
      </Button>
    ),
    className: 'w-[520px]',
  },
};
