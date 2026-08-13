import type { Meta, StoryObj } from '@storybook/react';
import { PageDivider } from '@/components/layout/page-divider';

const meta = {
  title: 'Layout/PageDivider',
  component: PageDivider,
} satisfies Meta<typeof PageDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[520px] space-y-4 text-sm text-slate-600">
      <p>Content above the divider.</p>
      <PageDivider />
      <p>Content below the divider.</p>
    </div>
  ),
};
