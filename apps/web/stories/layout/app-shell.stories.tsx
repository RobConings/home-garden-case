import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { AppShell } from '@/components/layout/app-shell';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHeaderAndSidebar: Story = {
  render: () => (
    <AppShell
      header={
        <PageContainer className="flex h-16 items-center justify-between py-0">
          <strong className="text-sm text-slate-950">ITP Home Garden</strong>
          <Button size="sm">Add garden</Button>
        </PageContainer>
      }
      sidebar={
        <nav className="grid gap-1 p-4 text-sm text-slate-600">
          <span className="rounded-md bg-emerald-50 px-3 py-2 font-medium text-emerald-900">
            Dashboard
          </span>
          <span className="px-3 py-2">Gardens</span>
          <span className="px-3 py-2">Plants</span>
        </nav>
      }
    >
      <PageContainer>
        <div className="rounded-lg border border-slate-200 bg-white p-6">Page content</div>
      </PageContainer>
    </AppShell>
  ),
};
