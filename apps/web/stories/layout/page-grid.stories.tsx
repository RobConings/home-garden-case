import type { Meta, StoryObj } from '@storybook/react';
import { PageGrid } from '@/components/layout/page-grid';
import { PageSection } from '@/components/layout/page-section';

const meta = {
  title: 'Layout/PageGrid',
  component: PageGrid,
  args: {
    layout: 'rightSidebar',
    gap: 'md',
    align: 'stretch',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['oneColumn', 'twoColumn', 'threeColumn', 'leftSidebar', 'rightSidebar'],
    },
    columns: {
      control: 'inline-radio',
      options: [1, 2, 3, 4],
    },
    gap: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'stretch'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NamedAreas: Story = {
  render: (args) => (
    <div className="p-6">
      <PageGrid {...args}>
        <PageSection slot="top" spacing="none">
          <Area name="top" />
        </PageSection>
        <PageSection slot="main" spacing="none">
          <Area name="main" />
        </PageSection>
        <PageSection slot="sidebar" spacing="none">
          <Area name="sidebar" />
        </PageSection>
        <PageSection slot="column1" spacing="none">
          <Area name="column1" />
        </PageSection>
        <PageSection slot="column2" spacing="none">
          <Area name="column2" />
        </PageSection>
        <PageSection slot="column3" spacing="none">
          <Area name="column3" />
        </PageSection>
        <PageSection slot="bottom" spacing="none">
          <Area name="bottom" />
        </PageSection>
      </PageGrid>
    </div>
  ),
};

function Area({ name }: { name: string }) {
  return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">{name}</div>;
}
