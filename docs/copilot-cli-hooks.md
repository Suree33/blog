# Copilot CLI hooks

GitHub Copilot CLI の hook 設定は `.github/hooks/*.json` に配置する。

このリポジトリでは `postToolUse` hook を使い、`edit` / `write` / `create` 成功後に対象ファイルだけへフォーマットと lint を実行する。

## 設定ファイル

- `.github/hooks/copilot-file-quality.json`
- `.github/hooks/scripts/format-lint-edited-file.sh`

## 動作

- 対象拡張子では `pnpm exec prettier --write <file>` を実行する
- `js` / `ts` / `astro` 系ファイルでは続けて `pnpm exec eslint <file>` を実行する
- `postToolUse` の入力 JSON から編集対象ファイルの `path` を取り出している

## 補足

`pnpm format` や `pnpm lint` の npm script はリポジトリ全体を対象にするため、hook からは使わずファイル単位で実行できる CLI (`prettier`, `eslint`) を直接呼び出す。
