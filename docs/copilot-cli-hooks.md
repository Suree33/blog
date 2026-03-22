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

## Usage

1. hook 設定を有効にする。対象リポジトリの `.github/hooks/` 配下に `copilot-file-quality.json` を配置し、このリポジトリと同じく `postToolUse` から `.github/hooks/scripts/format-lint-edited-file.sh` を呼び出す。
2. 前提コマンドをインストールする。最低でも `pnpm`、`prettier`、`eslint` が実行できる状態にしておく。あわせて、このスクリプトは入力 JSON の解析に `jq`、絶対パス解決に `python3` を使うため、それらも必要。
3. Copilot CLI で通常どおり `edit` / `write` / `create` を実行する。`postToolUse` hook は成功時だけ動作し、編集した 1 ファイルだけを対象に整形と lint を行う。
4. 手動で動作確認する場合は、hook スクリプトへ `postToolUse` 相当の JSON を標準入力で渡す。

```bash
printf '%s\n' '{
  "toolName": "edit",
  "toolArgs": "{\"path\":\"src/components/Header.astro\"}",
  "toolResult": {"resultType": "success"},
  "cwd": "/path/to/repo"
}' | .github/hooks/scripts/format-lint-edited-file.sh
```

5. 実際に hook が内部で行う処理を個別に試したい場合は、対象ファイルへ直接 CLI を実行する。

```bash
pnpm exec prettier --write src/components/Header.astro
pnpm exec eslint src/components/Header.astro
```

### 典型的なワークフロー

- `edit`: 既存ファイルを編集して成功すると、対象拡張子であれば `pnpm exec prettier --write <file>` を実行する。`js` / `ts` / `astro` 系なら続けて `pnpm exec eslint <file>` も実行する。
- `write`: ファイル内容を上書きした場合も `edit` と同じ条件で hook が走る。1 ファイル単位なので、保存したファイルだけが整形・検証される。
- `create`: 新規ファイル作成後も同様に処理される。たとえば新しい `.astro` や `.ts` を作ると Prettier 実行後に ESLint まで確認される。

### Caveats

- Prettier の対象は `*.js`, `*.mjs`, `*.cjs`, `*.jsx`, `*.ts`, `*.mts`, `*.cts`, `*.tsx`, `*.astro`, `*.json`, `*.md`, `*.css`。
- ESLint は `*.js`, `*.mjs`, `*.cjs`, `*.jsx`, `*.ts`, `*.mts`, `*.cts`, `*.tsx`, `*.astro` のときだけ実行される。つまり `js` / `ts` / `astro` 系は format 後に lint まで走る。
- `postToolUse` の結果が失敗だった場合、または編集対象パスを JSON から取り出せなかった場合、hook は何もせず終了する。
