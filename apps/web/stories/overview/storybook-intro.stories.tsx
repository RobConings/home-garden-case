import type { Meta, StoryObj } from '@storybook/react';
import { BrandMark } from '@/components/shared/brand-mark';

function StorybookIntro() {
  return (
    <main className="grid min-h-[360px] place-items-center bg-[var(--rootly-background)] p-8 text-[var(--rootly-text)]">
      <section className="max-w-xl">
        <BrandMark className="mb-8" />
        <p className="mb-2 text-sm font-medium text-[var(--rootly-primary)]">Rootly Storybook</p>
        <h1 className="mb-3 text-3xl font-semibold">Component workspace</h1>
        <p className="text-base leading-7 text-[var(--rootly-text-muted)]">
          Build Rootly from reusable UI, shared composition, layout primitives, and
          feature-scoped components. Stories live in the dedicated stories tree.
        </p>
      </section>
    </main>
  );
}

const meta = {
  title: 'Overview/Intro',
  component: StorybookIntro,
} satisfies Meta<typeof StorybookIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
