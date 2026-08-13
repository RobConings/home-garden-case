import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const slotClasses = {
  full: 'lg:[grid-column:1/-1]',
  top: 'lg:[grid-area:top]',
  main: 'lg:[grid-area:main]',
  bottom: 'lg:[grid-area:bottom]',
  sidebar: 'lg:[grid-area:sidebar]',
  column1: 'lg:[grid-area:column1]',
  column2: 'lg:[grid-area:column2]',
  column3: 'lg:[grid-area:column3]',
  column4: 'lg:[grid-area:column4]',
} satisfies Record<string, string>;

const spacingClasses = {
  none: '',
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-6',
} satisfies Record<string, string>;

export type PageSectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  slot?: keyof typeof slotClasses;
  spacing?: keyof typeof spacingClasses;
};

export function PageSection({
  className,
  eyebrow,
  title,
  description,
  actions,
  slot,
  spacing = 'lg',
  children,
  ...props
}: PageSectionProps) {
  const hasHeader = eyebrow || title || description || actions;

  return (
    <section
      className={cn('min-w-0', spacingClasses[spacing], slot ? slotClasses[slot] : null, className)}
      {...props}
    >
      {hasHeader ? (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-2xl font-semibold text-slate-950">{title}</h2> : null}
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
