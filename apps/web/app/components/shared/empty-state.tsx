import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Sprout,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
