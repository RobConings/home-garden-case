import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
};

export function Progress({ className, value, max = 100, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[var(--rootly-surface-muted)]',
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--rootly-primary)] transition-[width]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
