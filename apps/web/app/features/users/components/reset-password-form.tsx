import type { ElementType, ReactNode } from 'react';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { textLimits } from '@/lib/plain-text';

export type ResetPasswordFormErrors = Partial<
  Record<'emailAddress' | 'password' | 'confirmPassword' | 'form', string>
>;

export type ResetPasswordFormValues = {
  emailAddress: string;
};

export type ResetPasswordFormProps = {
  errors?: ResetPasswordFormErrors;
  values?: ResetPasswordFormValues;
  as?: ElementType;
  isSubmitting?: boolean;
  successMessage?: string;
  footerAction?: ReactNode;
};

export function ResetPasswordForm({
  errors = {},
  values,
  as: FormComponent = 'form',
  isSubmitting = false,
  successMessage,
  footerAction,
}: ResetPasswordFormProps) {
  return (
    <GeneralForm
      method="post"
      as={FormComponent}
      title="Reset your password"
      description="Choose a new password for your Rootly account."
      footer={
        <>
          {footerAction}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting password' : 'Reset password'}
          </Button>
        </>
      }
    >
      {successMessage ? (
        <p className="rounded-md border border-[var(--rootly-primary)]/25 bg-[var(--rootly-primary-soft)] px-3 py-2 text-sm text-[var(--rootly-primary)]">
          {successMessage}
        </p>
      ) : null}
      {errors.form ? (
        <p className="rounded-md border border-[var(--rootly-danger)]/25 bg-[var(--rootly-danger-soft)] px-3 py-2 text-sm text-[var(--rootly-danger)]">
          {errors.form}
        </p>
      ) : null}
      <Field id="emailAddress" label="Email" error={errors.emailAddress}>
        <Input
          id="emailAddress"
          name="emailAddress"
          type="email"
          autoComplete="email"
          defaultValue={values?.emailAddress}
          maxLength={textLimits.email}
          required
        />
      </Field>
      <Field id="password" label="New password" error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={textLimits.password}
          required
        />
      </Field>
      <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          maxLength={textLimits.password}
          showRequirements={false}
          required
        />
      </Field>
    </GeneralForm>
  );
}
