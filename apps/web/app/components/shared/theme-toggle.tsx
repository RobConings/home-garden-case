import { useFetcher } from '@remix-run/react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useTheme } from '@/providers';

export function ThemeToggle() {
  const fetcher = useFetcher();
  const { isLoggedIn } = useCurrentUser();
  const { mode, setMode } = useTheme();
  const nextMode = mode === 'dark' ? 'light' : 'dark';

  function handleToggle() {
    setMode(nextMode);

    if (isLoggedIn) {
      fetcher.submit(
        { themePreference: nextMode },
        {
          method: 'post',
          action: '/resources/theme',
        },
      );
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={handleToggle}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
