import type { Meta, StoryObj } from '@storybook/react';
import { PageStack } from '@/components/layout/page-stack';

const meta = {
  title: 'Layout/PageStack',
  component: PageStack,
  args: {
    gap: 'md',
  },
  argTypes: {
    gap: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof PageStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Cards: Story = {
  render: (args) => (
    <PageStack {...args} className="w-[420px]">
      {['Overview', 'Capacity', 'Upcoming work'].map((item) => (
        <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {item}
        </div>
      ))}
    </PageStack>
  ),
};
