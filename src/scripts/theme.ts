type ThemePreference = 'system' | 'light' | 'dark';
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const parsePreference = (value: string | null): ThemePreference | null => {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return null;
};

const getSystemTheme = (): Theme => (mediaQuery.matches ? 'dark' : 'light');

const resolveTheme = (
  preference: ThemePreference,
): { preference: ThemePreference; theme: Theme } => {
  const theme = preference === 'system' ? getSystemTheme() : preference;
  return { preference, theme };
};

const applyTheme = (preference: ThemePreference, theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

const persistPreference = (preference: ThemePreference) => {
  try {
    if (preference === 'system') {
      localStorage.setItem(STORAGE_KEY, 'system');
      return;
    }
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // no-op when storage is unavailable
  }
};

const readStoredPreference = (): ThemePreference | null => {
  try {
    return parsePreference(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

const nextPreference = (current: ThemePreference): ThemePreference => {
  if (current === 'system') return 'light';
  if (current === 'light') return 'dark';
  return 'system';
};

const updateButtons = (
  buttons: HTMLButtonElement[],
  preference: ThemePreference,
  theme: Theme,
) => {
  const labelByPreference: Record<ThemePreference, string> = {
    system: 'テーマ: システム設定に追従',
    light: 'テーマ: ライトモードに固定',
    dark: 'テーマ: ダークモードに固定',
  };
  const shortLabelByPreference: Record<ThemePreference, string> = {
    system: '自動',
    light: 'ライト',
    dark: 'ダーク',
  };

  buttons.forEach((button) => {
    button.dataset.themePreference = preference;
    button.dataset.theme = theme;
    button.setAttribute('aria-label', labelByPreference[preference]);
    const labelEl = button.querySelector<HTMLElement>('[data-theme-label]');
    if (labelEl) {
      labelEl.textContent = shortLabelByPreference[preference];
    }
  });
};

const applyPreference = (
  preference: ThemePreference,
): { preference: ThemePreference; theme: Theme } => {
  const resolved = resolveTheme(preference);
  applyTheme(resolved.preference, resolved.theme);
  persistPreference(resolved.preference);
  return resolved;
};

export const initThemeToggle = (selector = '[data-theme-toggle]') => {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(selector),
  );
  if (!buttons.length) return;

  let currentPreference: ThemePreference =
    readStoredPreference() ?? 'system';
  let resolved = applyPreference(currentPreference);
  updateButtons(buttons, resolved.preference, resolved.theme);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      currentPreference = nextPreference(currentPreference);
      resolved = applyPreference(currentPreference);
      updateButtons(buttons, resolved.preference, resolved.theme);
    });
  });

  mediaQuery.addEventListener('change', () => {
    if (currentPreference === 'system') {
      resolved = applyPreference('system');
      updateButtons(buttons, resolved.preference, resolved.theme);
    }
  });
};
