export const rootlyTheme = {
  light: {
    background: '#FAF8F3',
    surface: '#FFFFFF',
    text: '#182019',
    primary: '#2F8F46',
    secondary: '#8A5A3B',
    accent: '#E97828',
  },
  dark: {
    background: '#101611',
    surface: '#182019',
    text: '#F6F7F3',
    primary: '#78C850',
    secondary: '#B9825A',
    accent: '#F49A55',
  },
} as const;

export type RootlyThemeMode = keyof typeof rootlyTheme;

export function getThemeClass(mode: RootlyThemeMode) {
  return mode === 'dark' ? 'dark' : '';
}
