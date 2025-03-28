---
name: ブログ記事作成
type: task
version: 1.0.0
agent: CodeActAgent
author: Suree33
inputs:
  - name: TITLE
    description: 'ブログ記事のタイトル'
    required: true
  - name: DESCRIPTION
    description: '記事の簡単な説明'
    required: true
  - name: SLUG
    description: 'URLスラッグ（英数字とハイフンのみ）'
    required: true
  - name: TAGS
    description: 'カンマ区切りのタグリスト'
    required: true
---

# ブログ記事作成タスク

このタスクは新しいブログ記事のテンプレートを作成し、適切なメタデータを設定します。

## 手順

1. 入力されたデータを検証
2. 記事ファイルパスを決定
3. フロントマターを含む記事テンプレートを作成
4. 必要に応じてアセットディレクトリを作成

## 実行

### 入力検証

まず、提供された入力を検証します:

- `TITLE`: 空でないこと
- `SLUG`: 英数字とハイフンのみを含む有効なスラッグであること
- `TAGS`: 有効なタグリストであること

### ファイルパス決定

ブログ記事は `src/content/blog/` ディレクトリに保存します。ファイル名は提供されたスラッグに基づきます。

### 記事テンプレート作成

現在の日付を使用してフロントマターを作成し、記事テンプレートを生成します。

```markdown
---
title: '{{ TITLE }}'
description: '{{ DESCRIPTION }}'
pubDate: 'YYYY-MM-DD'
tags: [{ { TAGS } }]
draft: false
---

# {{ TITLE }}

ここに記事の内容を書きます。

## はじめに

## 本文

## まとめ
```

### アセット

記事用の画像を保存するためのアセットディレクトリは `src/assets/images/` です。

## 完了

新しいブログ記事テンプレートが作成されました。次のステップ:

1. 記事の内容を編集して充実させる
2. 必要に応じて画像や他のメディアを追加する
3. `draft: false` に設定して公開する
