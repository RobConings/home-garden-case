import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { PageRow } from '@/components/layout/page-row';

const meta = {
  title: 'Layout/PageRow',
  component: PageRow,
  args: {
    gap: 'md',
    align: 'between',
  },
  argTypes: {
    gap: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between'],
    },
  },
} satisfies Meta<typeof PageRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: (args) => (
    <PageRow {...args} className="w-[520px] rounded-lg border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-950">Garden actions</span>
      <Button size="sm">Save</Button>
    </PageRow>
  ),
};
