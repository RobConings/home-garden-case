import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export type FieldProps = {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ id, label, description, error, children, className }: FieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm leading-5 text-red-700">{error}</p>
      ) : description ? (
        <p className="text-sm leading-5 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
