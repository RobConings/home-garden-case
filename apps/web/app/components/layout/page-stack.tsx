import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const pageStackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
});

export type PageStackProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageStackVariants>;

export function PageStack({ className, gap, ...props }: PageStackProps) {
  return <div className={cn(pageStackVariants({ gap }), className)} {...props} />;
}
