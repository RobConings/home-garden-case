import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)] px-3 pr-9 text-sm text-[var(--rootly-text)] shadow-sm transition-colors focus:border-[var(--rootly-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rootly-primary)]/15 disabled:cursor-not-allowed disabled:bg-[var(--rootly-surface-muted)] disabled:text-[var(--rootly-text-muted)]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rootly-text-muted)]"
      />
    </div>
  );
}
