import type { Meta, StoryObj } from '@storybook/react';
import { ContentSection } from '@/components/layout/content-section';

const meta = {
  title: 'Layout/ContentSection',
  component: ContentSection,
  args: {
    layout: 'threeColumn',
    gap: 'md',
    align: 'stretch',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: [
        'oneColumn',
        'twoColumn',
        'threeColumn',
        'fourColumn',
        'rightSidebar',
        'leftSidebar',
      ],
    },
    gap: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'stretch'],
    },
  },
} satisfies Meta<typeof ContentSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ContentSection {...args} className="w-[920px]">
      {['Garden form', 'Plant preview', 'Capacity', 'Notes'].map((item) => (
        <div key={item} className="rounded-md border border-slate-200 bg-white p-4 text-sm">
          {item}
        </div>
      ))}
    </ContentSection>
  ),
};
