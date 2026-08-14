import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MessageVariant = 'success' | 'error';

type ToastMessage = {
  id: number;
  variant: MessageVariant;
  title: string;
  description?: string;
};

type AddMessageInput = {
  title: string;
  description?: string;
};

type MessageContextValue = {
  success: (message: AddMessageInput | string) => void;
  error: (message: AddMessageInput | string) => void;
  dismiss: (id: number) => void;
};

const toastDuration = 5000;
const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef<Map<number, ReturnType<typeof window.setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addMessage = useCallback(
    (variant: MessageVariant, input: AddMessageInput | string) => {
      const message = normalizeMessage(input);
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setMessages((currentMessages) => [...currentMessages, { id, variant, ...message }]);

      const timer = window.setTimeout(() => {
        dismiss(id);
      }, toastDuration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      success: (message: AddMessageInput | string) => addMessage('success', message),
      error: (message: AddMessageInput | string) => addMessage('error', message),
      dismiss,
    }),
    [addMessage, dismiss],
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      <ToastViewport messages={messages} onDismiss={dismiss} />
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

function normalizeMessage(input: AddMessageInput | string): AddMessageInput {
  if (typeof input === 'string') {
    return { title: input };
  }

  return input;
}

function ToastViewport({
  messages,
  onDismiss,
}: {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 grid w-[calc(100%-2rem)] max-w-sm gap-3 sm:right-6 sm:top-6">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  message,
  onDismiss,
}: {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const Icon = message.variant === 'success' ? CheckCircle2 : XCircle;

  return (
    <div
      role={message.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-md border bg-[var(--rootly-surface)] p-4 text-[var(--rootly-text)] shadow-lg',
        message.variant === 'success'
          ? 'border-[var(--rootly-primary)]/35'
          : 'border-[var(--rootly-danger)]/35',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          message.variant === 'success'
            ? 'text-[var(--rootly-primary)]'
            : 'text-[var(--rootly-danger)]',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{message.title}</p>
        {message.description ? (
          <p className="mt-1 text-sm leading-5 text-[var(--rootly-text-muted)]">
            {message.description}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Dismiss message"
        className="h-7 w-7"
        onClick={() => onDismiss(message.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
