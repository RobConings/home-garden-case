import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type ThemeMode = 'light' | 'dark';

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.dataset.theme = mode;
  localStorage.setItem('rootly-theme', mode);
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = localStorage.getItem('rootly-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    setMode(getInitialTheme());
  }, []);

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        const nextMode = mode === 'dark' ? 'light' : 'dark';
        setMode(nextMode);
        applyTheme(nextMode);
      }}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
