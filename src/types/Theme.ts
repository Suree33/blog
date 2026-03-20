export const THEMES = ['light', 'dark'] as const;

export type Theme = (typeof THEMES)[number];

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}
