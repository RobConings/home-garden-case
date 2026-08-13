import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Backyard beds</CardTitle>
        <CardDescription>24m2 available growing area</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">
          A quiet, reusable card shell for dashboard summaries and feature sections.
        </p>
      </CardContent>
    </Card>
  ),
};

export const GardenUsage: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Backyard beds</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>24m2 available growing area</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Space used</span>
          <span className="font-medium text-slate-950">16 / 24m2</span>
        </div>
        <Progress value={16} max={24} />
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          View garden
        </Button>
      </CardFooter>
    </Card>
  ),
};
