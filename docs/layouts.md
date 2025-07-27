# レイアウト

このドキュメントでは、`src/layouts/` ディレクトリに含まれるAstroレイアウトコンポーネントについて説明します。

## 概要

レイアウトは階層化された構造になっており、基本的なHTMLテンプレートから特化したブログ記事レイアウトまで、段階的に機能を拡張しています。

```
BaseLayout.astro (基本レイアウト)
├── ProseArticleLayout.astro (記事レイアウト)
│   └── MarkdownPostLayout.astro (ブログ記事レイアウト)
```

## BaseLayout.astro

サイト全体の基本HTMLテンプレートを提供するレイアウトです。

### 主な機能

- **HTMLドキュメント構造**: `<html>`, `<head>`, `<body>` の基本構造
- **メタタグ管理**: SEO、OGP、ビューポート設定
- **サイト設定統合**: `config.json` からサイト名、説明、OGイメージを読み込み
- **Google Analytics**: Partytown を使用したアナリティクス統合
- **ダークモード対応**: TailwindCSSのダークモードクラス
- **共通コンポーネント**: Header、Footer の配置

### Props

```typescript
interface Props {
  pageTitle?: string;
  ogimage?: string;
  description?: string;
}
```

### 使用例

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout pageTitle="ページタイトル" description="ページの説明">
  <!-- コンテンツ -->
</BaseLayout>
```

## ProseArticleLayout.astro

文章コンテンツに特化したレイアウトです。BaseLayoutを拡張しています。

### 主な機能

- **Prose スタイリング**: TailwindCSS の typography プラグインを使用
- **レスポンシブデザイン**: 異なる画面サイズに対応
- **ダークモード対応**: prose-invert クラスによる自動切り替え
- **タイポグラフィ設定**: 見出し、コード、画像の統一スタイル

### Proseクラスの特徴

- `prose-h1:mb-10 prose-h1:mt-6 prose-h1:text-center prose-h1:text-3xl`: H1の中央配置と大きなサイズ
- `prose-h2:border-b prose-h2:border-b-neutral-300 prose-h2:pb-2`: H2に下線を追加
- `prose-h3:border-b prose-h3:border-b-neutral-300 prose-h3:pb-2`: H3に下線を追加
- `prose-img:rounded`: 画像に角丸を適用
- `prose-code:font-normal`: インラインコードのフォント調整

### Props

BaseLayoutと同じPropsを継承します。

### 使用例

```astro
---
import ProseArticleLayout from '../layouts/ProseArticleLayout.astro';
---

<ProseArticleLayout pageTitle="記事タイトル">
  <h1>記事タイトル</h1>
  <p>記事本文...</p>
</ProseArticleLayout>
```

## MarkdownPostLayout.astro

Markdownブログ記事専用のレイアウトです。ProseArticleLayoutを拡張しています。

### 主な機能

- **Frontmatter対応**: Markdownのメタデータを自動表示
- **タグ表示**: 記事タグのリンク生成
- **日付表示**: 公開日・更新日の表示（アイコン付き）
- **画像対応**: Frontmatterで指定した画像の表示
- **説明文表示**: 記事の概要を強調表示
- **Callout対応**: rehype-callouts プラグインのスタイル設定

### Frontmatter対応プロパティ

```typescript
interface Frontmatter {
  title: string;
  tags: string[];
  pubDate: string;
  updatedDate?: string;
  image?: {
    src: string;
    alt: string;
  };
  description?: string;
  ogimage?: {
    src: string;
  };
}
```

### 表示要素

1. **タグリスト**: ドット区切りで表示、各タグはリンク化
2. **公開日**: 羽ペンアイコン付きで表示
3. **更新日**: 回転アイコン付きで表示（存在する場合のみ）
4. **記事タイトル**: H1として表示
5. **アイキャッチ画像**: 指定時のみ表示
6. **記事説明**: グレー背景のボックスで表示

### カスタムスタイル

- **Callout対応**: GitHub風のコールアウトスタイル
- **ダークモード**: Calloutのボーダーと色をダークテーマに対応
- **アイコン**: astro-icon コンポーネントでFont Awesomeアイコンを使用

### 使用例

```astro
---
// Markdownファイルで自動的に使用される
// frontmatter部分でlayoutを指定
layout: ../../layouts/MarkdownPostLayout.astro
title: "ブログ記事タイトル"
tags: ["tech", "blog"]
pubDate: "2024-01-01"
---

# 記事内容

記事本文がここに来ます。
```

## 開発時の注意点

### レイアウトの選択指針

- **一般的なページ**: `BaseLayout` を使用
- **文章中心のページ**: `ProseArticleLayout` を使用
- **ブログ記事**: `MarkdownPostLayout` を使用（Markdownファイルで自動適用）

### カスタマイズ

レイアウトをカスタマイズする際は以下の点に注意してください：

1. **継承関係**: 上位レイアウトの変更は下位レイアウトにも影響します
2. **config.json**: サイト全体の設定は `src/config.json` で管理
3. **TailwindCSS**: スタイリングはTailwindクラスを使用
4. **ダークモード**: 全レイアウトでダークモード対応が必要

### プラグイン依存

- **astro-icon**: アイコン表示
- **rehype-callouts**: Callout機能
- **@tailwindcss/typography**: Proseスタイリング