import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const pageRowVariants = cva('flex flex-wrap', {
  variants: {
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      between: 'items-center justify-between',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'start',
  },
});

export type PageRowProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageRowVariants>;

export function PageRow({ className, gap, align, ...props }: PageRowProps) {
  return <div className={cn(pageRowVariants({ gap, align }), className)} {...props} />;
}
