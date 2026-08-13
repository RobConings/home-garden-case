import type { Meta, StoryObj } from '@storybook/react';

function StorybookIntro() {
  return (
    <main
      style={{
        display: 'grid',
        minHeight: '320px',
        placeItems: 'center',
        padding: '32px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <section style={{ maxWidth: '560px' }}>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>ITP Home Garden</p>
        <h1 style={{ margin: '8px 0 12px', color: '#111827', fontSize: '32px' }}>
          Component workspace
        </h1>
        <p style={{ margin: 0, color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          Storybook is ready for the Garden Planner UI. Add reusable primitives under
          components/ui, shared components under components/shared, layouts under
          components/layout, and feature-specific stories under features.
        </p>
      </section>
    </main>
  );
}

const meta = {
  title: 'Project/Intro',
  component: StorybookIntro,
} satisfies Meta<typeof StorybookIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
