import type { FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type GeneralFormProps = FormHTMLAttributes<HTMLFormElement> & {
  title?: string;
  description?: string;
  footer?: ReactNode;
};

export function GeneralForm({
  className,
  title,
  description,
  footer,
  children,
  ...props
}: GeneralFormProps) {
  return (
    <form
      className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    >
      {title || description ? (
        <div className="border-b border-slate-200 p-5">
          {title ? <h3 className="text-base font-semibold text-slate-950">{title}</h3> : null}
          {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
      ) : null}
      <div className="grid gap-5 p-5">{children}</div>
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-5">
          {footer}
        </div>
      ) : null}
    </form>
  );
}
