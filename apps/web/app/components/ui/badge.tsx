import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral:
          'border-[var(--rootly-border)] bg-[var(--rootly-surface-muted)] text-[var(--rootly-text-muted)]',
        success:
          'border-[var(--rootly-primary)]/25 bg-[var(--rootly-primary-soft)] text-[var(--rootly-primary)]',
        warning:
          'border-[var(--rootly-accent)]/25 bg-[var(--rootly-accent-soft)] text-[var(--rootly-accent)]',
        danger:
          'border-[var(--rootly-danger)]/25 bg-[var(--rootly-danger-soft)] text-[var(--rootly-danger)]',
        info: 'border-[var(--rootly-secondary)]/25 bg-[var(--rootly-secondary-soft)] text-[var(--rootly-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
