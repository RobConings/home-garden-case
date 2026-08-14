import { useMemo, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { passwordRequirements } from '@/lib/password';

const strengthLabels = ['Weak', 'Weak', 'Strong', 'Strongest'] as const;
const strengthBarClasses = [
  'bg-[var(--rootly-danger)]',
  'bg-[var(--rootly-danger)]',
  'bg-[var(--rootly-accent)]',
  'bg-[var(--rootly-primary)]',
] as const;

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  showRequirements?: boolean;
};

export function PasswordInput({
  className,
  onChange,
  showRequirements = true,
  ...props
}: PasswordInputProps) {
  const [password, setPassword] = useState(String(props.defaultValue || props.value || ''));
  const [isVisible, setIsVisible] = useState(false);
  const results = useMemo(
    () => passwordRequirements.map((requirement) => requirement.test(password)),
    [password],
  );
  const metCount = results.filter(Boolean).length;
  const strengthIndex = Math.max(0, metCount - 1) as 0 | 1 | 2 | 3;
  const strengthLabel = strengthLabels[strengthIndex];

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Input
          {...props}
          type={isVisible ? 'text' : 'password'}
          className={cn('pr-11', className)}
          onChange={(event) => {
            setPassword(event.target.value);
            onChange?.(event);
          }}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-md text-[var(--rootly-text-muted)] transition-colors hover:bg-[var(--rootly-surface-muted)] hover:text-[var(--rootly-text)] focus:outline-none focus:ring-2 focus:ring-[var(--rootly-primary)]/25 disabled:pointer-events-none disabled:opacity-50"
          disabled={props.disabled}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      </div>
      {showRequirements ? (
        <div className="grid gap-2" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--rootly-surface-muted)]">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  strengthBarClasses[strengthIndex],
                )}
                style={{ width: `${Math.max(1, metCount) * 25}%` }}
              />
            </div>
            <span className="w-20 text-right text-xs font-medium text-[var(--rootly-text-muted)]">
              {strengthLabel}
            </span>
          </div>
          <ul className="grid gap-1 text-xs text-[var(--rootly-text-muted)] sm:grid-cols-2">
            {passwordRequirements.map((requirement, index) => {
              const isMet = results[index];

              return (
                <li key={requirement.label} className="flex items-center gap-1.5">
                  {isMet ? (
                    <Check className="h-3.5 w-3.5 text-[var(--rootly-primary)]" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-[var(--rootly-danger)]" />
                  )}
                  {requirement.label}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
