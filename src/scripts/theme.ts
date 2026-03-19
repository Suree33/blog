/**
 * テーマ設定を管理するモジュール
 *
 * システム設定、ライト、ダークの3つのテーマモードを循環的に切り替える機能を提供します。
 * テーマ設定はlocalStorageに永続化されます。
 */

export type Theme = 'system' | 'light' | 'dark';

const THEME_KEY = 'theme-preference';

/**
 * localStorageからテーマ設定を取得する
 * @returns 保存されているテーマ設定、または'system'（デフォルト）
 */
export function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * localStorageにテーマ設定を保存する
 * @param theme - 保存するテーマ設定
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;

  localStorage.setItem(THEME_KEY, theme);
}

/**
 * システムのカラースキーム設定を取得する
 * @returns システムがダークモードの場合は'dark'、それ以外は'light'
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (
    typeof window === 'undefined' ||
    !window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'light';
  }
  return 'dark';
}

/**
 * 現在のテーマ設定に基づいて、実際に適用すべきテーマを解決する
 * @param theme - テーマ設定（'system'の場合はシステム設定を参照）
 * @returns 実際に適用すべきテーマ（'light' または 'dark'）
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * HTMLのルート要素にdarkクラスを適用または削除する
 * @param theme - 適用するテーマ設定
 */
export function applyTheme(theme: Theme): void {
  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;

  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * テーマを次の状態に切り替える（system -> light -> dark -> system）
 * @returns 切り替え後のテーマ設定
 */
export function cycleTheme(): Theme {
  const current = getStoredTheme();
  let next: Theme;

  switch (current) {
    case 'system':
      next = 'light';
      break;
    case 'light':
      next = 'dark';
      break;
    case 'dark':
      next = 'system';
      break;
  }

  setStoredTheme(next);
  applyTheme(next);
  return next;
}

/**
 * テーマ切り替えボタンの初期化
 * @param buttonSelector - ボタン要素を選択するCSSセレクタ
 */
export function initThemeToggle(buttonSelector: string): void {
  const button = document.querySelector<HTMLElement>(buttonSelector);
  if (!button) return;

  // 初期テーマを適用
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  // ボタンクリック時にテーマを切り替え
  button.addEventListener('click', () => {
    cycleTheme();
  });

  // システム設定の変更を監視（themeが'system'の場合のみ）
  if (typeof window !== 'undefined') {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        const currentTheme = getStoredTheme();
        if (currentTheme === 'system') {
          applyTheme('system');
        }
      });
  }
}
