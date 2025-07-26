# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Astro + TypeScript + TailwindCSSで構築されたDaiki Satoの個人ブログ (sur33.com)。pnpmをパッケージマネージャーとして使用し、Cloudflare Pagesでホスティング。

## 開発コマンド

- `pnpm run dev` - 開発サーバー起動
- `pnpm run dev:host` - ホストマシンからアクセス可能な開発サーバー起動  
- `pnpm run build` - 本番ビルド
- `pnpm run preview` - ビルド結果のプレビュー
- `pnpm run format` - Prettierでコード整形
- `pnpm run lint` - ESLintでコード検証

## アーキテクチャ

### ディレクトリ構成
- `src/components/` - Astroコンポーネント (Header, Footer, PostItem等)
- `src/layouts/` - ページレイアウト (BaseLayout, MarkdownPostLayout等)
- `src/pages/` - ページファイル、`posts/`以下にMarkdownブログ記事
- `src/types/` - TypeScript型定義 (Post.ts等)
- `src/scripts/` - クライアントサイドJavaScript
- `src/styles/` - グローバルCSS、カスタムスタイル
- `src/config.json` - サイト設定 (siteName, author等)

### ブログ記事
- Markdownファイルに frontmatter でメタデータを記述
- `Post` インターフェースで型定義済み
- remarkプラグインでリンクカード、コードタイトル表示機能
- rehypeプラグインでコールアウト機能

### スタイリング
- TailwindCSS + PostCSS + autoprefixer
- カスタムCSS: remark-code.css (コードブロック), remark-link-card.css (リンクカード)

### 設定ファイル
- `astro.config.mjs` - Astro設定、remarkプラグイン、integrations
- `eslint.config.js` - strict TypeScript + Astro + jsx-a11y ルール  
- `tsconfig.json` - TypeScript設定
- `.prettierrc.json` - コード整形設定

コード変更後は `pnpm run lint` でESLint検証を実行してください。