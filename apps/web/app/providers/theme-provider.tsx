import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { RootlyThemeMode } from '@/lib/theme';

const themeStorageKey = 'rootly-theme';

type ThemeContextValue = {
  mode: RootlyThemeMode;
  setMode: (mode: RootlyThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is RootlyThemeMode {
  return value === 'light' || value === 'dark';
}

function getPreferredTheme(initialMode?: RootlyThemeMode | null): RootlyThemeMode {
  if (initialMode) {
    return initialMode;
  }

  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    if (isThemeMode(stored)) {
      return stored;
    }
  } catch {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: RootlyThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.dataset.theme = mode;

  try {
    window.localStorage.setItem(themeStorageKey, mode);
  } catch {
    // Theme persistence is progressive enhancement; DOM state still updates.
  }
}

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode?: RootlyThemeMode | null;
}) {
  const [mode, setThemeMode] = useState<RootlyThemeMode>(initialMode ?? 'light');

  useEffect(() => {
    const preferredMode = getPreferredTheme(initialMode);
    setThemeMode(preferredMode);
    applyTheme(preferredMode);
  }, [initialMode]);

  const setMode = useCallback((nextMode: RootlyThemeMode) => {
    setThemeMode(nextMode);
    applyTheme(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setThemeMode((currentMode) => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';
      applyTheme(nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
