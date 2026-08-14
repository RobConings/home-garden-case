import type { ReactNode } from 'react';
import { MessageProvider } from './message-provider';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MessageProvider>{children}</MessageProvider>
    </ThemeProvider>
  );
}
