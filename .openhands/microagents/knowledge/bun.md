---
name: Bun Knowledge
type: knowledge
version: 1.0.0
agent: CodeActAgent
author: Suree33
triggers:
  - bun
  - bunjs
  - bun runtime
  - zig
  - javascript runtime
---

# Bun ランタイム知識

## 概要

Bunは高速なJavaScript/TypeScriptランタイム、バンドラー、パッケージマネージャー、テストランナーを提供するオールインワンのJavaScriptツールキットです。Zigプログラミング言語で書かれており、パフォーマンスに重点を置いています。

## 主な特徴

- **高速な実行速度**: Node.jsやDenoよりも高速なスタートアップと実行
- **組み込みのパッケージマネージャー**: npmパッケージの高速インストール
- **バンドラー**: 内蔵のWebpack互換バンドラー
- **TypeScriptサポート**: トランスパイルなしでTypeScriptを直接実行
- **互換性**: Node.js APIの大部分と互換性あり
- **テストランナー**: Jest互換のテストフレームワーク内蔵

## 主要コマンド

```bash
# パッケージをインストール
bun install

# 開発サーバーを起動
bun dev

# JavaScriptファイルを実行
bun run index.ts

# プロジェクトをビルド
bun build

# テストを実行
bun test

# パッケージを追加
bun add <package>

# パッケージを削除
bun remove <package>
```

## プロジェクトの初期化

```bash
# Bunプロジェクトを初期化
bun init

# 特定のフレームワークでプロジェクトを初期化
bun create <template>
```

## 互換性ノート

- Node.jsモジュールの大部分をサポート
- Node.jsネイティブモジュールには一部制限あり
- WASMをサポート
- WebAPIをブラウザ同様にサポート

## パフォーマンス特性

- 起動時間: Node.jsの4倍高速
- パッケージインストール: npmの20倍以上高速
- 低いメモリ使用量
- 効率的なファイルシステムアクセス

## 公式ドキュメント

詳細情報は[Bun公式ドキュメント](https://bun.sh/docs)を参照してください。
