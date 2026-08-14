import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  card?: boolean;
  className?: string;
};

export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
  card = false,
  className,
}: PageTitleProps) {
  const content = (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--rootly-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold text-[var(--rootly-text)]">{title}</h1>
        {description ? (
          <p className="mt-2 text-base leading-7 text-[var(--rootly-text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );

  if (!card) {
    return content;
  }

  return (
    <Card>
      <CardContent className="p-5">{content}</CardContent>
    </Card>
  );
}
