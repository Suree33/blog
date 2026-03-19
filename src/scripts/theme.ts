export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

export const setStoredTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEY, theme);
};

export const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
};

export const applyTheme = (theme: Theme): void => {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const nextTheme = (current: Theme): Theme => {
  const order: Theme[] = ['system', 'light', 'dark'];
  const index = order.indexOf(current);
  return order[(index + 1) % order.length];
};

export const initTheme = (): void => {
  const theme = getStoredTheme();
  applyTheme(theme);

  // OS 設定変更時に system 状態なら追従する
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    });
};
