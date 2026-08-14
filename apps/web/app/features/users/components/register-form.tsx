import type { ElementType, ReactNode } from 'react';
import { Field, GeneralForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

export type RegisterFormErrors = Partial<
  Record<'firstName' | 'lastName' | 'emailAddress' | 'password' | 'form', string>
>;

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  emailAddress: string;
};

export type RegisterFormProps = {
  errors?: RegisterFormErrors;
  values?: RegisterFormValues;
  as?: ElementType;
  isSubmitting?: boolean;
  successMessage?: string;
  cancelAction?: ReactNode;
};

export function RegisterForm({
  errors = {},
  values,
  as: FormComponent = 'form',
  isSubmitting = false,
  successMessage,
  cancelAction,
}: RegisterFormProps) {
  return (
    <GeneralForm
      method="post"
      as={FormComponent}
      title="Create your Rootly account"
      description="Start with the essentials. Homes and gardens can be added after registration."
      footer={
        <>
          {cancelAction}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account' : 'Create account'}
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="First name" error={errors.firstName}>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={values?.firstName}
            required
          />
        </Field>
        <Field id="lastName" label="Last name" error={errors.lastName}>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={values?.lastName}
            required
          />
        </Field>
      </div>
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
      <Field
        id="password"
        label="Password"
        error={errors.password}
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
    </GeneralForm>
  );
}
