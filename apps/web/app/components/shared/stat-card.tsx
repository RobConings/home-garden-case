import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--rootly-text-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-[var(--rootly-text)]">
              {value}
            </p>
          </div>
          {Icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--rootly-primary-soft)] text-[var(--rootly-primary)]">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
          ) : null}
        </div>
        {description || trend ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            {description ? (
              <p className="text-[var(--rootly-text-muted)]">{description}</p>
            ) : (
              <span />
            )}
            {trend ? <div className="font-medium text-[var(--rootly-primary)]">{trend}</div> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
