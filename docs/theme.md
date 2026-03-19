# テーマ切り替え

このドキュメントでは、ヘッダーに実装した3状態テーマ切り替え機能について説明します。

## 概要

ヘッダーにテーマ切り替えボタンを追加しました。ボタンを押すたびに以下の順でテーマが循環します。

```
system → light → dark → system → ...
```

| 状態     | 説明                                          |
| -------- | --------------------------------------------- |
| `system` | OS の `prefers-color-scheme` に自動追従する    |
| `light`  | OS 設定に関係なく常にライトモードで表示する    |
| `dark`   | OS 設定に関係なく常にダークモードで表示する    |

## 実装ファイル

| ファイル                             | 役割                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| `src/scripts/theme.ts`               | テーマ管理ロジック（localStorage 読み書き・クラス付与） |
| `src/components/ThemeToggle.astro`   | テーマ切り替えボタンコンポーネント                       |
| `src/layouts/BaseLayout.astro`       | 初回描画チラつき防止のインラインスクリプト               |
| `src/components/Header.astro`        | ヘッダーへの ThemeToggle 組み込み                        |

## 状態保持

テーマ設定は **localStorage** に保存します。

- キー: `theme-preference`
- 値: `"system"` / `"light"` / `"dark"`
- 保存期間: localStorage の通常動作（ユーザーがキャッシュを消去するまで保持）

### localStorage を選んだ理由

- テーマ設定はクライアント専用の設定であり、サーバーへ送信する必要がない
- Cookie のように毎リクエストに付随しないため軽量
- 個人ブログのテーマ設定保持として十分な機能を持つ

## OS 設定への追従

- `system` 状態のとき、`window.matchMedia('(prefers-color-scheme: dark)')` を参照して表示テーマを決定します
- OS の設定が変わった場合、`change` イベントを監視し、`system` 状態であればテーマを再適用します
- `light` / `dark` を選択した場合は OS 設定に関係なく固定されます

## 初回描画チラつき防止

`BaseLayout.astro` の `<head>` 内に `is:inline` スクリプトを追加し、ページ描画前に localStorage の値を読み込んで `<html>` 要素への `dark` クラス付与を行います。

```html
<script is:inline>
  (function () {
    var stored = localStorage.getItem('theme-preference');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

これにより、CSS の `dark:` クラスが正しく適用された状態で初期描画が行われます。

## ThemeToggle コンポーネント

`src/components/ThemeToggle.astro` はボタンとクライアントスクリプトを含みます。

- 現在の状態に応じてアイコンを切り替えます（モニター / 太陽 / 月）
- `aria-label` に現在の状態名を含めており、スクリーンリーダー対応しています
- デスクトップ・モバイル両方のヘッダーに配置されています

## アクセシビリティ

- `<button>` 要素を使用
- `aria-label` に「テーマを切り替える（現在: system）」のように現在の状態を含める
- `title` 属性でツールチップを表示
- アイコンには `aria-hidden="true"` を付与
