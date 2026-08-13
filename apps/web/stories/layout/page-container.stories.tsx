import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from '@/components/layout/page-container';

const meta = {
  title: 'Layout/PageContainer',
  component: PageContainer,
  args: {
    size: 'lg',
    minHeight: 'none',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'full'],
    },
    minHeight: {
      control: 'inline-radio',
      options: ['none', 'screen', 'content'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <PageContainer {...args}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm">
        Container content constrained by the selected size.
      </div>
    </PageContainer>
  ),
};
