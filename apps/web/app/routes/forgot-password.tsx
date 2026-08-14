import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { z } from 'zod/v4';
import { PageContainer, PageStack } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/features/marketing/components';
import { resetPassword } from '@/features/users/api/users.server';
import { ResetPasswordForm, type ResetPasswordFormErrors } from '@/features/users/components';
import { ApiClientError } from '@/lib/api.server';
import {
  hasMinimumPasswordLength,
  hasPasswordCapital,
  hasPasswordDigit,
  hasPasswordSpecialCharacter,
  isStrongPassword,
} from '@/lib/password';
import { getCurrentUser } from '@/lib/session.server';
import { useMessages } from '@/providers';

const resetPasswordFormSchema = z
  .object({
    emailAddress: z
      .email('Enter a valid email address')
      .min(1, 'Email is required')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .refine(hasMinimumPasswordLength, 'Password must include at least 8 characters')
      .refine(hasPasswordCapital, 'Password must include a capital letter')
      .refine(hasPasswordDigit, 'Password must include a digit')
      .refine(hasPasswordSpecialCharacter, 'Password must include a special character')
      .refine(isStrongPassword, 'Password must meet all password requirements'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetPasswordActionData = {
  errors: ResetPasswordFormErrors;
  values: {
    emailAddress: string;
  };
  successMessage?: string;
  messageId?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Reset Password | Rootly' },
  {
    name: 'description',
    content: 'Reset your Rootly account password.',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);

  if (user) {
    return redirect('/dashboard');
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawValues = {
    emailAddress: String(formData.get('emailAddress') || ''),
    password: String(formData.get('password') || ''),
    confirmPassword: String(formData.get('confirmPassword') || ''),
  };

  const parsed = resetPasswordFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return json<ResetPasswordActionData>(
      {
        errors: toFormErrors(parsed.error),
        values: {
          emailAddress: rawValues.emailAddress,
        },
        messageId: createMessageId(),
      },
      { status: 400 },
    );
  }

  try {
    await resetPassword({
      emailAddress: parsed.data.emailAddress,
      password: parsed.data.password,
    });

    return json<ResetPasswordActionData>({
      errors: {},
      values: {
        emailAddress: parsed.data.emailAddress,
      },
      successMessage: 'Password updated. You can login with your new password.',
      messageId: createMessageId(),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      const userWasNotFound =
        error.status === 404 &&
        Array.isArray(error.details) &&
        error.details.some(
          (detail) => typeof detail === 'string' && detail.startsWith('User with email'),
        );

      return json<ResetPasswordActionData>(
        {
          errors: {
            form: userWasNotFound
              ? 'No Rootly account uses this email.'
              : 'We could not reset your password. Please try again.',
          },
          values: {
            emailAddress: parsed.data.emailAddress,
          },
          messageId: createMessageId(),
        },
        { status: error.status },
      );
    }

    return json<ResetPasswordActionData>(
      {
        errors: {
          form: 'We could not reset your password right now. Please try again in a moment.',
        },
        values: {
          emailAddress: parsed.data.emailAddress,
        },
        messageId: createMessageId(),
      },
      { status: 503 },
    );
  }
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const messages = useMessages();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData?.messageId) {
      return;
    }

    if (actionData.successMessage) {
      messages.showSuccess(actionData.successMessage);
      return;
    }

    if (actionData.errors.form) {
      messages.showError(actionData.errors.form);
      return;
    }

    if (Object.keys(actionData.errors).length > 0) {
      messages.showError('Please check the highlighted password reset fields.');
    }
  }, [actionData, messages]);

  return (
    <PageStack
      className="min-h-screen bg-[var(--rootly-background)] text-[var(--rootly-text)]"
      gap="none"
    >
      <PublicHeader />
      <PageContainer className="grid min-h-[calc(100vh-112px)] items-center py-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <PageStack gap="md">
            <Badge variant="success">Account access</Badge>
            <h1 className="max-w-xl text-4xl font-semibold text-[var(--rootly-text)] sm:text-5xl">
              Set a new Rootly password.
            </h1>
            <div>
              <Button asChild variant="ghost">
                <Link to="/login">Back to login</Link>
              </Button>
            </div>
          </PageStack>
          <ResetPasswordForm
            as={Form}
            errors={actionData?.errors}
            values={actionData?.values}
            successMessage={actionData?.successMessage}
            isSubmitting={isSubmitting}
            footerAction={
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
            }
          />
        </div>
      </PageContainer>
    </PageStack>
  );
}

function toFormErrors(error: z.ZodError): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (
      fieldName === 'emailAddress' ||
      fieldName === 'password' ||
      fieldName === 'confirmPassword'
    ) {
      errors[fieldName] = issue.message;
    }
  }

  return errors;
}

function createMessageId() {
  return `${Date.now()}-${Math.random()}`;
}
