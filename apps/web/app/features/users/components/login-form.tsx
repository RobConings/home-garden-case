import type { ElementType, ReactNode } from 'react';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

export type LoginFormErrors = Partial<Record<'emailAddress' | 'password' | 'form', string>>;

export type LoginFormValues = {
  emailAddress: string;
};

export type LoginFormProps = {
  errors?: LoginFormErrors;
  values?: LoginFormValues;
  as?: ElementType;
  isSubmitting?: boolean;
  footerAction?: ReactNode;
  passwordAction?: ReactNode;
};

export function LoginForm({
  errors = {},
  values,
  as: FormComponent = 'form',
  isSubmitting = false,
  footerAction,
  passwordAction,
}: LoginFormProps) {
  return (
    <GeneralForm
      method="post"
      as={FormComponent}
      title="Login to Rootly"
      description="Open your garden workspace with your account email and password."
      footer={
        <>
          {footerAction}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in' : 'Login'}
          </Button>
        </>
      }
    >
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
          required
        />
      </Field>
      <Field id="password" label="Password" error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          showRequirements={false}
          required
        />
        {passwordAction ? <div className="flex justify-start">{passwordAction}</div> : null}
      </Field>
    </GeneralForm>
  );
}
