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

export function StatCard({ label, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
          </div>
          {Icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
          ) : null}
        </div>
        {description || trend ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            {description ? <p className="text-slate-500">{description}</p> : <span />}
            {trend ? <div className="font-medium text-emerald-700">{trend}</div> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
