# テーマ切り替え

このドキュメントでは、ライト / ダーク / OSシステム設定の3ステートを持つテーマ切り替え機能について説明します。

## 概要

ヘッダーのテーマトグルボタンからライト・ダーク・OS設定の3ステートを切り替えられます。  
選択状態は `localStorage` に保存され、ページリロード後も維持されます。  
OSシステム設定に戻した場合は `localStorage` のエントリを削除し、CSS `@media (prefers-color-scheme)` に委ねます。

## テーマの3ステート

| ステート | `<html>` クラス | `localStorage["theme"]` | アイコン |
|----------|-----------------|--------------------------|---------|
| OSシステム設定 (デフォルト) | なし | 未設定 | `lucide:sun-moon` |
| ダーク | `dark` | `"dark"` | `lucide:moon` |
| ライト | `light` | `"light"` | `lucide:sun` |

### 切り替えの順序

```
OSがダークの場合: OSシステム設定 → ライト → ダーク → OSシステム設定
OSがライトの場合: OSシステム設定 → ダーク → ライト → OSシステム設定
```

具体的には、ボタンクリック時に次のロジックで切り替えます:

1. 現在のテーマが **OSシステム設定** (クラスなし) の場合 → OSテーマの反対を適用
2. 現在のテーマが **OSテーマと一致しない** 場合 → OSテーマと同じテーマを明示適用
3. 現在のテーマが **OSテーマと一致する** 場合 → OSシステム設定に戻す

## ファイル構成

```
src/
├── types/
│   └── Theme.ts              # Theme 型・THEMES 定数・isTheme() 型ガード
├── components/
│   ├── ThemeToggle.astro     # テーマトグルボタン本体
│   ├── HeaderIcon.astro      # ヘッダーアイコン用の汎用ラッパー (a / button)
│   └── HeaderIcons.astro     # ヘッダーアイコン群 (SNSリンク + ThemeToggle)
├── layouts/
│   └── BaseLayout.astro      # 初期描画前に保存済みテーマを適用して FOUC を防ぐ
└── styles/
    └── global.css            # dark カスタムバリアント定義
```

## コンポーネント詳細

### `ThemeToggle.astro`

テーマトグルボタン。`HeaderIcon` を `<button>` として描画し、現在のテーマに応じてアイコンを切り替えます。

| テーマ | 表示アイコン |
|--------|-------------|
| OSシステム設定 | `lucide:sun-moon` |
| ダーク | `lucide:moon` |
| ライト | `lucide:sun` |

アイコンの表示切り替えは Tailwind CSS のユーティリティクラス (`hidden`, `in-[html.dark]:block` 等) で行います。スクリプト側でのDOM操作は不要です。

**内蔵スクリプト** (クライアントサイド):
- ページ読み込み時に `localStorage` のテーマを再適用する (`applyTheme(getStoredTheme())`)
- `[data-theme-toggle]` 属性を持つ要素すべてにクリックイベントを登録する

### `HeaderIcon.astro`

ヘッダーアイコン用の汎用ラッパーコンポーネント。`href` の有無で `<a>` または `<button>` を出し分けます。

```typescript
interface Props {
  class?: string;
  href?: string;
  id?: string;
  ariaLabel?: string;
  [key: `data-${string}`]: unknown; // data-* 属性を任意に渡せる
}
```

- `href` あり → `<a target="_blank" rel="noopener noreferrer">`
- `href` なし → `<button>`

どちらも共通のホバー・アクティブスタイル (`hover:bg-neutral-200 dark:hover:bg-neutral-800` 等) を持ちます。

### `HeaderIcons.astro`

旧 `SocialIcons.astro` の後継コンポーネント。SNS リンク3つ + `ThemeToggle` をまとめて描画します。

### `src/types/Theme.ts`

```typescript
export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number]; // 'light' | 'dark'
export function isTheme(value: string | null): value is Theme;
```

`null` は「OSシステム設定」を表す内部状態 (`ThemeState = Theme | null`) として使用します。

## FOUC (初回ちらつき) 防止

`BaseLayout.astro` の `<head>` 先頭に `is:inline` スクリプトを配置し、ページの初期描画前にテーマを適用します。

```html
<script is:inline>
  (() => {
    const storedTheme = window.localStorage.getItem('theme');
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      html.classList.add(storedTheme);
      html.style.colorScheme = storedTheme;
      return;
    }
    html.style.colorScheme = 'light dark';
  })();
</script>
```

`is:inline` により Astro のバンドルを経由せず即時実行されるため、CSSの適用前にクラスが設定されます。

## CSS カスタムバリアント

`src/styles/global.css` に `dark` カスタムバリアントを定義しています。

```css
@custom-variant dark {
  .dark & {
    @slot;
  }

  @media (prefers-color-scheme: dark) {
    html:not(.light):not(.dark) & {
      @slot;
    }
  }
}
```

これにより `dark:` プレフィックスが次の2条件でスタイルを適用します:

1. `<html>` に `.dark` クラスがある場合
2. `<html>` に `.light` も `.dark` もなく、OSがダーク設定の場合

## 依存パッケージ

| パッケージ | 用途 |
|-----------|------|
| `astro-icon` | Astro コンポーネント内でアイコンを描画する `Icon` コンポーネントを提供 |
| `@iconify-json/lucide` | `lucide:sun`, `lucide:moon`, `lucide:sun-moon` アイコン |
