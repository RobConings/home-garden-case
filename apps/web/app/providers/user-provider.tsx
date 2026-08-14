import { createContext, type ReactNode, useContext, useMemo } from 'react';

export type CurrentUser = {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  themePreference: 'light' | 'dark';
};

type UserContextValue = {
  user: CurrentUser | null;
  isLoggedIn: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser | null;
}) {
  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useCurrentUser must be used within UserProvider');
  }

  return context;
}
