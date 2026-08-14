import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput } from '@/components/ui/password-input';

const meta = {
  title: 'UI/PasswordInput',
  component: PasswordInput,
  args: {
    id: 'password',
    name: 'password',
    autoComplete: 'new-password',
    placeholder: 'Create a password',
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Weak: Story = {
  args: {
    defaultValue: 'garden',
  },
};

export const Strong: Story = {
  args: {
    defaultValue: 'Garden12',
  },
};

export const Strongest: Story = {
  args: {
    defaultValue: 'Garden12!',
  },
};
