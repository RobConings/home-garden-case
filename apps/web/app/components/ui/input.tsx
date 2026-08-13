import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)] px-3 text-sm text-[var(--rootly-text)] shadow-sm transition-colors placeholder:text-[var(--rootly-text-muted)] focus:border-[var(--rootly-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rootly-primary)]/15 disabled:cursor-not-allowed disabled:bg-[var(--rootly-surface-muted)] disabled:text-[var(--rootly-text-muted)]',
        className,
      )}
      {...props}
    />
  );
}
