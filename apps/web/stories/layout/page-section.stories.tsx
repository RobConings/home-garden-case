import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/components/layout/page-section';

const meta = {
  title: 'Layout/PageSection',
  component: PageSection,
  args: {
    eyebrow: 'Planner',
    title: 'Garden dashboard',
    description: 'Track garden capacity, plants, and upcoming planting work.',
    spacing: 'lg',
  },
  argTypes: {
    spacing: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
    },
    slot: {
      control: 'select',
      options: [
        'full',
        'top',
        'main',
        'bottom',
        'sidebar',
        'column1',
        'column2',
        'column3',
        'column4',
      ],
    },
  },
} satisfies Meta<typeof PageSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHeader: Story = {
  render: (args) => (
    <PageSection {...args} actions={<Button size="sm">Create garden</Button>} className="w-[720px]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm">Section content</div>
    </PageSection>
  ),
};
