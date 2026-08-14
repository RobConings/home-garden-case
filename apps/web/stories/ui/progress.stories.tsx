import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function ProgressDemo() {
  const [value, setValue] = useState(16);

  return (
    <div className="w-[360px] space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Garden space</span>
        <span className="font-medium text-slate-950">{value} / 24m2</span>
      </div>
      <Progress value={value} max={24} />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setValue((current) => Math.max(0, current - 2))}
        >
          Remove
        </Button>
        <Button size="sm" onClick={() => setValue((current) => Math.min(24, current + 2))}>
          Add
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'UI/Progress',
  component: Progress,
  args: {
    value: 16,
    max: 24,
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: () => <ProgressDemo />,
};
