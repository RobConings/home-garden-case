import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { MessageProvider, useMessages } from '@/providers/message-provider';

function MessageProviderDemo() {
  const messages = useMessages();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        onClick={() => messages.showSuccess('Garden saved. Your planting plan is ready.')}
      >
        Success toast
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={() => messages.showError('Could not save garden. Check the required fields.')}
      >
        Error toast
      </Button>
    </div>
  );
}

const meta = {
  title: 'Providers/MessageProvider',
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <MessageProvider>
      <MessageProviderDemo />
    </MessageProvider>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
