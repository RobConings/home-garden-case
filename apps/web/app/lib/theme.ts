export const rootlyTheme = {
  light: {
    background: '#FAF8F3',
    surface: '#FFFFFF',
    text: '#182019',
    primary: '#26783A',
    secondary: '#8A5A3B',
    accent: '#E97828',
  },
  dark: {
    background: '#0F1110',
    surface: '#191C1A',
    text: '#F7F8F4',
    primary: '#8FDC66',
    secondary: '#D2A077',
    accent: '#FFAD66',
  },
} as const;

export type RootlyThemeMode = keyof typeof rootlyTheme;

export function getThemeClass(mode: RootlyThemeMode) {
  return mode === 'dark' ? 'dark' : '';
}
