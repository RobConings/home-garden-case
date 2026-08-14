import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MessageType = 'success' | 'error' | 'warning';

type Message = {
  id: number;
  type: MessageType;
  text: string;
};

type MessageContextValue = {
  showMessage: (type: MessageType, text: string) => void;
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  showWarning: (text: string) => void;
  dismissMessage: (id: number) => void;
  clearMessages: () => void;
};

type MessageProviderProps = {
  children: ReactNode;
};

const MessageContext = createContext<MessageContextValue | null>(null);

const messageStyles = {
  success: {
    className: 'border-[var(--rootly-success)] text-[var(--rootly-success)]',
    icon: CheckCircle2,
  },
  error: {
    className: 'border-[var(--rootly-danger)] text-[var(--rootly-danger)]',
    icon: XCircle,
  },
  warning: {
    className: 'border-[var(--rootly-accent)] text-[var(--rootly-accent)]',
    icon: AlertTriangle,
  },
};

export function MessageProvider({ children }: MessageProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const dismissMessage = useCallback((id: number) => {
    setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));
  }, []);

  const showMessage = useCallback(
    (type: MessageType, text: string) => {
      const cleanText = text.trim();

      if (!cleanText) {
        return;
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setMessages((currentMessages) => [...currentMessages, { id, type, text: cleanText }]);
      window.setTimeout(() => dismissMessage(id), 5000);
    },
    [dismissMessage],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  const value = useMemo<MessageContextValue>(
    () => ({
      showMessage,
      showSuccess: (text) => showMessage('success', text),
      showError: (text) => showMessage('error', text),
      showWarning: (text) => showMessage('warning', text),
      dismissMessage,
      clearMessages,
    }),
    [clearMessages, dismissMessage, showMessage],
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-6 z-50 grid w-[min(24rem,calc(100vw-3rem))] gap-3">
        {messages.map((message) => (
          <MessageToast key={message.id} message={message} onDismiss={dismissMessage} />
        ))}
      </div>
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error('useMessages must be used within MessageProvider');
  }

  return context;
}

export function useRouteMessages({
  successMessage,
  errorMessage,
}: {
  successMessage?: string | null;
  errorMessage?: string | null;
}) {
  const { showError, showSuccess } = useMessages();

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      clearToastSearchParam();
    }
  }, [showSuccess, successMessage]);

  useEffect(() => {
    if (errorMessage) {
      showError(errorMessage);
    }
  }, [errorMessage, showError]);
}

function MessageToast({
  message,
  onDismiss,
}: {
  message: Message;
  onDismiss: (id: number) => void;
}) {
  const style = messageStyles[message.type];
  const Icon = style.icon;
  const isError = message.type === 'error';

  return (
    <div
      aria-live={isError ? 'assertive' : 'polite'}
      className={[
        'flex items-start gap-3 rounded-md border-l-4 border-y border-r bg-[var(--rootly-surface)] px-4 py-3 text-sm shadow-lg',
        style.className,
      ].join(' ')}
      role={isError ? 'alert' : 'status'}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1 font-medium leading-5 text-[var(--rootly-text)]">
        {message.text}
      </p>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        aria-label="Dismiss message"
        onClick={() => onDismiss(message.id)}
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function clearToastSearchParam() {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);

  if (!url.searchParams.has('toast')) {
    return;
  }

  url.searchParams.delete('toast');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}
