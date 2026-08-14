import { cva, type VariantProps } from 'class-variance-authority';
import type { ElementType, HTMLAttributes } from 'react';
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
      end: 'items-center justify-end',
      between: 'items-center justify-between',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'start',
  },
});

export type PageRowProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageRowVariants> & {
    as?: ElementType;
  };

export function PageRow({ className, gap, align, as: Comp = 'div', ...props }: PageRowProps) {
  return <Comp className={cn(pageRowVariants({ gap, align }), className)} {...props} />;
}
