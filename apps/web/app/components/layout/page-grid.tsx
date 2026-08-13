import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
} satisfies Record<number, string>;

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
} satisfies Record<string, string>;

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
} satisfies Record<string, string>;

const layoutStyles = {
  oneColumn: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: "'top' 'main' 'bottom'",
  },
  twoColumn: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gridTemplateAreas: "'top top' 'column1 column2' 'bottom bottom'",
  },
  threeColumn: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
    gridTemplateAreas: "'top top top' 'column1 column2 column3' 'bottom bottom bottom'",
  },
  leftSidebar: {
    gridTemplateColumns: '280px minmax(0, 1fr)',
    gridTemplateAreas: "'top top' 'sidebar main' 'bottom bottom'",
  },
  rightSidebar: {
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gridTemplateAreas: "'top top' 'main sidebar' 'bottom bottom'",
  },
} satisfies Record<string, CSSProperties>;

export type PageGridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: keyof typeof columnClasses;
  gap?: keyof typeof gapClasses;
  align?: keyof typeof alignClasses;
  layout?: keyof typeof layoutStyles;
};

export function PageGrid({
  className,
  columns = 3,
  gap = 'md',
  align = 'stretch',
  layout,
  style,
  ...props
}: PageGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        layout
          ? 'grid-cols-1 lg:[grid-template-columns:var(--page-grid-columns)] lg:[grid-template-areas:var(--page-grid-areas)]'
          : columnClasses[columns],
        gapClasses[gap],
        alignClasses[align],
        className,
      )}
      style={{
        ...(layout
          ? ({
              '--page-grid-columns': layoutStyles[layout].gridTemplateColumns,
              '--page-grid-areas': layoutStyles[layout].gridTemplateAreas,
            } as CSSProperties)
          : null),
        ...style,
      }}
      {...props}
    />
  );
}
