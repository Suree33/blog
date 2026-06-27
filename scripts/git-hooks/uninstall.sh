#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'Error: Gitリポジトリ内で実行してください。\n' >&2
  exit 1
}
cd "$repo_root"

if git config --local --get-regexp '^hook\.blog-ci\.' >/dev/null 2>&1; then
  git config remove-section --local hook.blog-ci
  printf 'Git pre-commit hookを解除しました。\n'
else
  printf 'Git pre-commit hookは登録されていません。\n'
fi
