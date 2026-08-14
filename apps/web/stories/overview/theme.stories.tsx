import type { Meta, StoryObj } from '@storybook/react';
import { rootlyTheme, type RootlyThemeMode } from '@/lib/theme';
import { BrandMark } from '@/components/shared/brand-mark';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ThemeSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)] p-3">
      <div
        className="mb-3 h-12 rounded-md border border-[var(--rootly-border)]"
        style={{ background: value }}
      />
      <p className="text-sm font-medium text-[var(--rootly-text)]">{name}</p>
      <p className="mt-1 text-xs text-[var(--rootly-text-muted)]">{value}</p>
    </div>
  );
}

function ThemePanel({ mode }: { mode: RootlyThemeMode }) {
  const theme = rootlyTheme[mode];

  return (
    <div data-theme={mode} className={mode === 'dark' ? 'dark' : ''}>
      <Card className="w-[720px] bg-[var(--rootly-surface)]">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <BrandMark compact />
            <Badge variant={mode === 'dark' ? 'info' : 'success'}>{mode}</Badge>
          </div>
          <CardTitle>Rootly {mode} theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(theme).map(([name, value]) => (
              <ThemeSwatch key={name} name={name} value={value} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: 'Overview/Theme',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  render: () => <ThemePanel mode="light" />,
};

export const Dark: Story = {
  render: () => <ThemePanel mode="dark" />,
};
