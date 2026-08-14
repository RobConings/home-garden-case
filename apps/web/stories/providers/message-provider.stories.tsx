import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { MessageProvider, useMessages } from '@/providers/message-provider';

function MessageProviderDemo() {
  const messages = useMessages();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        onClick={() =>
          messages.success({
            title: 'Garden saved',
            description: 'Your planting plan is ready for the next step.',
          })
        }
      >
        Success toast
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={() =>
          messages.error({
            title: 'Could not save garden',
            description: 'Check the required fields and try again.',
          })
        }
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
