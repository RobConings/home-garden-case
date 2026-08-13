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
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-emerald-700 transition-[width]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
