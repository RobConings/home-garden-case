import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootly-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'border-[var(--rootly-primary)] bg-[var(--rootly-primary)] text-[var(--rootly-primary-foreground)] hover:border-[var(--rootly-primary-hover)] hover:bg-[var(--rootly-primary-hover)]',
        secondary:
          'border-[var(--rootly-border)] bg-[var(--rootly-surface)] text-[var(--rootly-text)] hover:bg-[var(--rootly-surface-muted)]',
        subtle:
          'border-transparent bg-[var(--rootly-primary-soft)] text-[var(--rootly-primary)] hover:bg-[var(--rootly-secondary-soft)]',
        ghost:
          'border-transparent bg-transparent text-[var(--rootly-text-muted)] hover:bg-[var(--rootly-surface-muted)]',
        danger:
          'border-[var(--rootly-danger-action)] bg-[var(--rootly-danger-action)] text-[var(--rootly-danger-action-foreground)] hover:border-[var(--rootly-danger-action-hover)] hover:bg-[var(--rootly-danger-action-hover)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
