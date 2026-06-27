# CI向けスクリプト

## `build:ci`

```bash
pnpm run build:ci
```

CIでビルドだけを実行するためのスクリプトです。

- 実行内容: `astro build`
- `build:ci` 自体のコマンドとして `astro build` を直接実行します。
- `prebuild` は `build` スクリプトに紐づくフック名のため、`pnpm run build:ci` では実行されません。
- このリポジトリのCIでは `lint` を独立ステップで実行しているため、`prebuild` の重複実行を避ける目的で使います。

## 使い分け

- ローカル開発: `pnpm run build`
  - `prebuild` が有効で、`pnpm lint` を先に実行します。
- CI: `pnpm run build:ci`
  - `prebuild` をスキップし、ビルドのみ実行します。

## pnpm 11設定

CIでは `package.json` の `packageManager` に従ってpnpm 11を使用します。

- pnpm 11では `.npmrc` からauth/registry以外の設定を読みません。
- プロジェクトのpnpm設定は `pnpm-workspace.yaml` に集約します。
- 依存パッケージのビルドスクリプト許可は `allowBuilds` で明示します。
- `strictDepBuilds` の既定値が有効なため、未レビューのビルドスクリプトがあると `pnpm install` は失敗します。

## Git pre-commit

Git 2.54 の設定ベース pre-commit hook では、CI のうち次のチェックを逐次実行します。

1. `pnpm run format:check`
2. `pnpm run lint`
3. `pnpm run build:ci`

Playwright E2E はブラウザとフォントの環境準備が必要で実行時間も長いため、pre-commit には含めず GitHub Actions で実行します。導入方法は [Git hooks](./git-hooks.md) を参照してください。
