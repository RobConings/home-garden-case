import type { Meta, StoryObj } from '@storybook/react';
import { BrandMark } from '@/components/shared/brand-mark';

const meta = {
  title: 'Shared/BrandMark',
  component: BrandMark,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BrandMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {
  render: () => (
    <div className="rounded-lg bg-[#101611] p-6">
      <BrandMark />
    </div>
  ),
};

export const Compact: Story = {
  args: {
    compact: true,
  },
};
