import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const contentSectionVariants = cva('grid w-full', {
  variants: {
    layout: {
      oneColumn: 'grid-cols-1',
      twoColumn: 'grid-cols-1 xl:grid-cols-2',
      threeColumn: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
      fourColumn: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
      rightSidebar: 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]',
      leftSidebar: 'grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]',
    },
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: {
    layout: 'oneColumn',
    gap: 'md',
    align: 'stretch',
  },
});

export type ContentSectionProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof contentSectionVariants>;

export function ContentSection({ className, layout, gap, align, ...props }: ContentSectionProps) {
  return (
    <div className={cn(contentSectionVariants({ layout, gap, align }), className)} {...props} />
  );
}
