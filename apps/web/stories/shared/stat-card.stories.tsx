import type { Meta, StoryObj } from '@storybook/react';
import { Flower2, Leaf, Sprout } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

const meta = {
  title: 'Shared/StatCard',
  component: StatCard,
  args: {
    label: 'Gardens',
    value: 3,
    description: '2 active this season',
    icon: Sprout,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'w-[260px]',
  },
};

export const DashboardSet: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-3 gap-4">
      <StatCard label="Gardens" value={3} description="2 active this season" icon={Sprout} />
      <StatCard label="Plants" value={24} description="Across all gardens" icon={Leaf} trend="+4" />
      <StatCard label="Flowers" value={8} description="Pollinator friendly" icon={Flower2} />
    </div>
  ),
};
