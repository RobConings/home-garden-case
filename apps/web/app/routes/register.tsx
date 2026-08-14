import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { z } from 'zod/v4';
import { PageContainer, PageStack } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/features/marketing/components';
import { RegisterForm, type RegisterFormErrors } from '@/features/users/components';
import { registerUser } from '@/features/users/api/users.server';
import { ApiClientError } from '@/lib/api.server';
import {
  hasMinimumPasswordLength,
  hasPasswordCapital,
  hasPasswordDigit,
  hasPasswordSpecialCharacter,
  isStrongPassword,
} from '@/lib/password';
import { useMessages } from '@/providers';

const registerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
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
});

type RegisterActionData = {
  errors: RegisterFormErrors;
  values: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  successMessage?: string;
  messageId?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Create a Rootly Account | Garden Planning Dashboard' },
  {
    name: 'description',
    content:
      'Create a Rootly account to start planning gardens, choosing plants, and organizing care reminders.',
  },
  { name: 'robots', content: 'index,follow' },
];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawValues = {
    firstName: String(formData.get('firstName') || ''),
    lastName: String(formData.get('lastName') || ''),
    emailAddress: String(formData.get('emailAddress') || ''),
    password: String(formData.get('password') || ''),
  };

  const parsed = registerFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return json<RegisterActionData>(
      {
        errors: toFormErrors(parsed.error),
        values: {
          firstName: rawValues.firstName,
          lastName: rawValues.lastName,
          emailAddress: rawValues.emailAddress,
        },
        messageId: createMessageId(),
      },
      { status: 400 },
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return json<RegisterActionData>({
      errors: {},
      values: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
      },
      successMessage: `Account created for ${user.firstName} ${user.lastName}.`,
      messageId: createMessageId(),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return json<RegisterActionData>(
        {
          errors: {
            form:
              error.status === 409
                ? 'An account with this email already exists.'
                : 'We could not create your account. Please try again.',
          },
          values: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            emailAddress: parsed.data.emailAddress,
          },
          messageId: createMessageId(),
        },
        { status: error.status },
      );
    }

    return json<RegisterActionData>(
      {
        errors: {
          form: 'We could not create your account right now. Please try again in a moment.',
        },
        values: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          emailAddress: parsed.data.emailAddress,
        },
        messageId: createMessageId(),
      },
      { status: 503 },
    );
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const messages = useMessages();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData?.messageId) {
      return;
    }

    if (actionData.successMessage) {
      messages.success(actionData.successMessage);
      return;
    }

    if (actionData.errors.form) {
      messages.error(actionData.errors.form);
      return;
    }

    if (Object.keys(actionData.errors).length > 0) {
      messages.error('Please check the highlighted registration fields.');
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
            <Badge variant="success">Start your garden workspace</Badge>
            <h1 className="max-w-xl text-4xl font-semibold text-[var(--rootly-text)] sm:text-5xl">
              Plan your first garden with a simple Rootly account.
            </h1>
            <div>
              <Button asChild variant="ghost">
                <Link to="/">Back to homepage</Link>
              </Button>
            </div>
          </PageStack>
          <RegisterForm
            as={Form}
            errors={actionData?.errors}
            values={actionData?.values}
            isSubmitting={isSubmitting}
            successMessage={actionData?.successMessage}
            cancelAction={
              <Button asChild variant="ghost">
                <Link to="/">Cancel</Link>
              </Button>
            }
          />
        </div>
      </PageContainer>
    </PageStack>
  );
}

function toFormErrors(error: z.ZodError): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (
      fieldName === 'firstName' ||
      fieldName === 'lastName' ||
      fieldName === 'emailAddress' ||
      fieldName === 'password'
    ) {
      errors[fieldName] = issue.message;
    }
  }

  return errors;
}

function createMessageId() {
  return `${Date.now()}-${Math.random()}`;
}
