import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)] px-3 py-2 text-sm text-[var(--rootly-text)] shadow-sm transition-colors placeholder:text-[var(--rootly-text-muted)] focus:border-[var(--rootly-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rootly-primary)]/15 disabled:cursor-not-allowed disabled:bg-[var(--rootly-surface-muted)] disabled:text-[var(--rootly-text-muted)]',
        className,
      )}
      {...props}
    />
  );
}
