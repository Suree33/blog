#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'Error: Gitリポジトリ内で実行してください。\n' >&2
  exit 1
}
cd "$repo_root"

if ! command -v pnpm >/dev/null 2>&1; then
  printf 'Error: pnpmが見つかりません。pnpmをセットアップしてください。\n' >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  printf 'Error: 依存関係が未インストールです。pnpm install --frozen-lockfile を実行してください。\n' >&2
  exit 1
fi

printf '[pre-commit] Check formatting\n'
pnpm run format:check

printf '[pre-commit] Run lint\n'
pnpm run lint

printf '[pre-commit] Build site\n'
pnpm run build:ci
