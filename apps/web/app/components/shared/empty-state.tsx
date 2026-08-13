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
        'flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--rootly-border)] bg-[var(--rootly-surface)] p-8 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rootly-primary-soft)] text-[var(--rootly-primary)]">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--rootly-text)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--rootly-text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
