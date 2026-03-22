---
layout: ../../layouts/MarkdownPostLayout.astro
title: ブログに3ステートのテーマ切り替えを追加した
pubDate: 2026-03-21
tags:
  - Astro
  - Tailwind CSS
description: 'ライト・ダーク・OS設定の3ステートを切り替えられるテーマトグルボタンを追加した。'
---

## 経緯

このブログは Tailwind CSS の `dark:` ユーティリティを使ってダークモード対応はしていたが、切り替えボタンが無く、OS の設定（`prefers-color-scheme`）のみを使っていた。

「外の明るい場所では OS をダークにしたまま、ブログだけライトで読みたい」みたいなケースに対応できていなかったので、手動で切り替えられるようにした。

## 3ステート

よくある2ステート（ライト / ダーク）ではなく、OS設定に戻せる3ステートにした。

| ステート | `<html>` クラス | アイコン |
|---|---|---|
| OS設定に従う（デフォルト） | なし | `lucide:sun-moon` |
| ダーク固定 | `dark` | `lucide:moon` |
| ライト固定 | `light` | `lucide:sun` |

状態は `localStorage["theme"]` に保存される。OS設定に戻したときは `localStorage` のエントリを削除して、`@media (prefers-color-scheme)` に完全に委ねる。

### 切り替えの順序

OS設定を起点に、逆方向を経由して戻ってくる順番になっている。

```
OSがダークの場合: OS設定 → ライト → ダーク → OS設定
OSがライトの場合: OS設定 → ダーク → ライト → OS設定
```

## 実装のポイント

### `@custom-variant dark` で OS設定と手動設定を両立

Tailwind CSS v4 の `@custom-variant` を使って、`dark:` が効く条件を調整した。

```css:src/styles/global.css
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

これにより、`dark:` プレフィックスが次の2条件で適用される:

1. `<html>` に `.dark` クラスがある（手動でダークを選択）
2. `<html>` に `.light` も `.dark` もなく、OS がダーク設定（OS設定に従うモード）

`.light` クラスが付いているときは `@media (prefers-color-scheme: dark)` のほうは無効になるので、OS がダークでもライト表示になる。

### ちらつき防止

ページロード時に `localStorage` のテーマを読んでクラスを適用しないと、一瞬 OS設定のテーマで表示されてから切り替わるちらつきが起きる。

`<head>` の先頭にスクリプトを置いて、ページ読み込み時に即時実行させることで対処した。

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

`is:inline` にすることで Astro のバンドル処理を経由しないため、CSS 適用前にクラスが設定される。これがないと特に「ライト固定」のときにダークで一瞬描画されてしまう。

### アイコン切り替えは CSS だけ

`ThemeToggle.astro` は3種のアイコン（`lucide:sun-moon`、`lucide:moon`、`lucide:sun`）をすべて DOM に持っておいて、Tailwind CSS のクラスで表示・非表示を切り替えている。

```astro
<Icon
  name="lucide:sun-moon"
  class="hidden [html:not(.light):not(.dark)_&]:block"
/>
<Icon name="lucide:moon" class="hidden in-[html.dark]:block" />
<Icon name="lucide:sun" class="hidden in-[html.light]:block" />
```