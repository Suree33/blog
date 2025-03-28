---
name: Tailwind CSS Knowledge
type: knowledge
version: 1.0.0
agent: CodeActAgent
author: Suree33
triggers:
  - tailwind
  - tailwindcss
  - tailwind css
  - utility-first css
  - typography plugin
---

# Tailwind CSS 知識

## 概要

Tailwind CSSはユーティリティファーストのCSSフレームワークで、クラス名を直接HTMLに適用することでスタイルを適用するアプローチを採用しています。

## 主な特徴

- **ユーティリティファースト**: スタイルシートを書く代わりに、ユーティリティクラスを適用
- **高度にカスタマイズ可能**: テーマ、バリアント、プラグインでカスタマイズ可能
- **レスポンシブデザイン**: モバイルファーストアプローチでブレークポイントベースのクラス提供
- **ダークモード対応**: 簡単なダークモードの実装
- **最小限のプロダクションCSSサイズ**: 使用したクラスのみをビルド

## 基本的な使用方法

```html
<div class="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
  <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">タイトル</h2>
  <p class="text-gray-700 dark:text-gray-300">コンテンツテキスト</p>
</div>
```

## 便利なユーティリティグループ

- **レイアウト**: `flex`, `grid`, `container`, `columns`
- **スペーシング**: `p-{size}`, `m-{size}`, `gap-{size}`
- **サイズ**: `w-{size}`, `h-{size}`, `max-w-{size}`
- **タイポグラフィ**: `text-{size}`, `font-{weight}`, `leading-{size}`
- **背景**: `bg-{color}`, `bg-opacity-{value}`
- **境界線**: `border-{width}`, `border-{color}`, `rounded-{size}`
- **エフェクト**: `shadow-{size}`, `opacity-{value}`
- **アニメーション**: `transition-{property}`, `duration-{time}`

## Tailwind CSS Typography Plugin

`@tailwindcss/typography`プラグインは、マークダウンコンテンツを美しくスタイリングするためのユーティリティを提供します。

```html
<article class="prose prose-lg dark:prose-invert">
  <!-- マークダウンコンテンツ -->
</article>
```

## 注意点

- クラス名が長くなる可能性がある
- HTMLが冗長になる可能性がある
- 学習曲線がある

## 公式ドキュメント

詳細情報は[Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)を参照してください。
