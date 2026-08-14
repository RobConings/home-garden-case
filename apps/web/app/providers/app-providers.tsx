import type { ReactNode } from 'react';
import { MessageProvider } from './message-provider';
import { ThemeProvider } from './theme-provider';
import { UserProvider, type CurrentUser } from './user-provider';

export function AppProviders({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser | null;
}) {
  return (
    <UserProvider user={user}>
      <ThemeProvider initialMode={user?.themePreference ?? null}>
        <MessageProvider>{children}</MessageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
