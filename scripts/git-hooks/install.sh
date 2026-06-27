#!/usr/bin/env bash
set -euo pipefail

readonly minimum_major=2
readonly minimum_minor=54

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'Error: Gitリポジトリ内で実行してください。\n' >&2
  exit 1
}
cd "$repo_root"

git_version="$(git --version | awk '{print $3}')"
git_major="${git_version%%.*}"
git_version_rest="${git_version#*.}"
git_minor="${git_version_rest%%.*}"

if ((git_major < minimum_major || (git_major == minimum_major && git_minor < minimum_minor))); then
  printf 'Error: Git 2.54以上が必要です（現在: %s）。\n' "$git_version" >&2
  exit 1
fi

git config set --local hook.blog-ci.command ./scripts/git-hooks/pre-commit.sh
git config unset --local --all hook.blog-ci.event 2>/dev/null || true
git config set --local --append hook.blog-ci.event pre-commit
git config set --local hook.blog-ci.enabled true

printf 'Git pre-commit hookを登録しました。\n'
git hook list pre-commit --show-scope
