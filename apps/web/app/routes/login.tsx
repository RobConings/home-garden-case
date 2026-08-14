import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { z } from 'zod/v4';
import { PageContainer, PageStack } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/features/marketing/components';
import { loginUser } from '@/features/users/api/users.server';
import { LoginForm, type LoginFormErrors } from '@/features/users/components';
import { ApiClientError } from '@/lib/api.server';
import { createUserSession, getCurrentUser } from '@/lib/session.server';
import { useMessages } from '@/providers';

const loginFormSchema = z.object({
  emailAddress: z
    .email('Enter a valid email address')
    .min(1, 'Email is required')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginActionData = {
  errors: LoginFormErrors;
  values: {
    emailAddress: string;
  };
  messageId?: string;
};

export const meta: MetaFunction = () => [
  { title: 'Login | Rootly' },
  {
    name: 'description',
    content: 'Login to Rootly to manage gardens, plants, and care reminders.',
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
  };

  const parsed = loginFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return json<LoginActionData>(
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
    const user = await loginUser(parsed.data);

    return await createUserSession({
      request,
      user,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return json<LoginActionData>(
        {
          errors: {
            form:
              error.status === 401
                ? 'The email or password is incorrect.'
                : 'We could not log you in. Please try again.',
          },
          values: {
            emailAddress: parsed.data.emailAddress,
          },
          messageId: createMessageId(),
        },
        { status: error.status },
      );
    }

    return json<LoginActionData>(
      {
        errors: {
          form: 'We could not log you in right now. Please try again in a moment.',
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

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const messages = useMessages();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData?.messageId) {
      return;
    }

    if (actionData.errors.form) {
      messages.showError(actionData.errors.form);
      return;
    }

    if (Object.keys(actionData.errors).length > 0) {
      messages.showError('Please check the highlighted login fields.');
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
            <Badge variant="success">Garden workspace</Badge>
            <h1 className="max-w-xl text-4xl font-semibold text-[var(--rootly-text)] sm:text-5xl">
              Return to your Rootly dashboard.
            </h1>
            <div>
              <Button asChild variant="ghost">
                <Link to="/">Back to homepage</Link>
              </Button>
            </div>
          </PageStack>
          <LoginForm
            as={Form}
            errors={actionData?.errors}
            values={actionData?.values}
            isSubmitting={isSubmitting}
            passwordAction={
              <Button asChild variant="ghost" size="sm" className="-ml-3">
                <Link to="/forgot-password">Forgot password?</Link>
              </Button>
            }
            footerAction={
              <Button asChild variant="ghost">
                <Link to="/register">Create account</Link>
              </Button>
            }
          />
        </div>
      </PageContainer>
    </PageStack>
  );
}

function toFormErrors(error: z.ZodError): LoginFormErrors {
  const errors: LoginFormErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (fieldName === 'emailAddress' || fieldName === 'password') {
      errors[fieldName] = issue.message;
    }
  }

  return errors;
}

function createMessageId() {
  return `${Date.now()}-${Math.random()}`;
}
