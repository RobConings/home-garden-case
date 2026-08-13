import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const pageContainerVariants = cva('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      full: 'max-w-none',
    },
    minHeight: {
      none: '',
      screen: 'min-h-screen',
      content: 'min-h-[calc(100vh-64px)]',
    },
  },
  defaultVariants: {
    size: 'lg',
    minHeight: 'none',
  },
});

export type PageContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageContainerVariants>;

export function PageContainer({ className, size, minHeight, ...props }: PageContainerProps) {
  return <div className={cn(pageContainerVariants({ size, minHeight }), className)} {...props} />;
}
