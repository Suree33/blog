---
name: Astro Knowledge
type: knowledge
version: 1.0.0
agent: CodeActAgent
author: Suree33
triggers:
  - astro
  - astro.build
  - astrojs
  - islands architecture
  - static site generator
---

# Astro フレームワーク知識

## 概要

Astroは高性能なWebサイト構築のためのオールインワンのWebフレームワークです。コンテンツ中心のWebサイトに特化しており、「アイランドアーキテクチャ」を採用しています。

## 主な特徴

- **サーバーファーストのアプローチ**: デフォルトでは静的HTML生成に特化
- **Zero JavaScript by default**: 必要な場所だけでJavaScriptを使用
- **コンポーネントアイランド**: 必要な場所でのみインタラクティブなコンポーネントを使用
- **UIフレームワーク非依存**: React、Vue、Svelte、Solid、Preact、Lit などと統合可能
- **最適化された資産**: 自動的に画像最適化やバンドリングを行う

## ファイル構造

```
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
└── astro.config.mjs
```

## 主要コマンド

```bash
# 開発サーバー起動
bun run dev

# 本番用ビルド
bun run build

# ビルド結果のプレビュー
bun run preview
```

## コンポーネント作成

```astro
---
// フロントマター（JavaScript/TypeScript）
const greeting = 'こんにちは';
---

<!-- テンプレート（HTML + JSX式） -->
<h1>{greeting}、Astro!</h1>

<style>
  /* スコープされたCSS */
  h1 {
    color: blue;
  }
</style>
```

## 設定ファイル

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
  integrations: [],
  output: 'static', // 'static' または 'server'
});
```

## ルーティング

- `src/pages/` ディレクトリ内のファイルが自動的にルートになる
- `.astro`、`.md`、`.mdx`、`.html`ファイルがサポートされている
- 動的ルートは `[param].astro` または `[...slug].astro` 形式で作成可能

## 統合機能

Astroは多くの統合機能を提供します：

- TailwindCSS
- MDX
- Cloudflare Pages
- Vercel
- Netlify
- React/Vue/Svelte などのUIフレームワーク

## 公式ドキュメント

詳細情報は[Astro公式ドキュメント](https://docs.astro.build/ja/)を参照してください。
