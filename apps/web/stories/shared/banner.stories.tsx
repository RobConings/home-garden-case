import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/shared/banner';

const meta = {
  title: 'Shared/Banner',
  component: Banner,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    badge: 'Garden planning, without guesswork',
    title: 'Rootly',
    description:
      'Design your garden, pick the right plants, and stay ahead of watering, nutrition, and sunlight needs from one calm planning dashboard.',
    imageSrc: '/banner.png',
    imageAlt:
      'Sunny home vegetable garden with raised beds, herbs, flowers, and a garden shed for Rootly garden planning',
    imageWidth: 1916,
    imageHeight: 821,
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: (
      <div className="flex flex-wrap gap-4">
        <Button size="lg">Start planning</Button>
        <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
          I already have an account
        </Button>
      </div>
    ),
  },
};

export const WithoutActions: Story = {};
