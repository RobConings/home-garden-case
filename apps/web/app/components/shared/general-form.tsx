import type { ElementType, FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type GeneralFormProps = FormHTMLAttributes<HTMLFormElement> & {
  title?: string;
  description?: string;
  footer?: ReactNode;
  as?: ElementType;
};

export function GeneralForm({
  className,
  title,
  description,
  footer,
  as: Comp = 'form',
  children,
  ...props
}: GeneralFormProps) {
  return (
    <Comp
      className={cn(
        'rounded-lg border border-[var(--rootly-border)] bg-[var(--rootly-surface)] shadow-sm',
        className,
      )}
      {...props}
    >
      {title || description ? (
        <div className="border-b border-[var(--rootly-border)] p-5">
          {title ? (
            <h3 className="text-base font-semibold text-[var(--rootly-text)]">{title}</h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--rootly-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-5 p-5">{children}</div>
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-[var(--rootly-border)] p-5">
          {footer}
        </div>
      ) : null}
    </Comp>
  );
}
