import type { Meta, StoryObj } from '@storybook/react';
import { RegisterForm } from '@/features/users/components/register-form';

const meta = {
  title: 'Features/Users/RegisterForm',
  component: RegisterForm,
  args: {
    values: {
      firstName: 'Maya',
      lastName: 'Green',
      emailAddress: 'maya@example.com',
    },
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithErrors: Story = {
  args: {
    errors: {
      firstName: 'First name is required',
      emailAddress: 'Enter a valid email address',
      password: 'Password must be at least 8 characters',
    },
    values: {
      firstName: '',
      lastName: 'Green',
      emailAddress: 'not-an-email',
    },
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const Success: Story = {
  args: {
    successMessage: 'Account created for Maya Green.',
  },
};
