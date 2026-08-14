import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Panel({ title, children, className, contentClassName }: PanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn('grid gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
