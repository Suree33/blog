#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
scripts_dir="$repo_root/scripts/git-hooks"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="$3"
  [[ "$actual" == "$expected" ]] || fail "$message (expected: $expected, actual: $actual)"
}

test_install_and_uninstall() {
  local test_repo="$tmp_dir/install-repo"
  git init -q "$test_repo"
  mkdir -p "$test_repo/scripts/git-hooks"
  cp "$scripts_dir"/*.sh "$test_repo/scripts/git-hooks/"

  git -C "$test_repo" config set --local hook.keep.command true
  git -C "$test_repo" config set --local --append hook.keep.event pre-commit

  (cd "$test_repo" && scripts/git-hooks/install.sh)
  (cd "$test_repo" && scripts/git-hooks/install.sh)

  assert_equals \
    './scripts/git-hooks/pre-commit.sh' \
    "$(git -C "$test_repo" config --local --get hook.blog-ci.command)" \
    'install should register the repository hook command'
  assert_equals \
    '1' \
    "$(git -C "$test_repo" config --local --get-all hook.blog-ci.event | wc -l | tr -d ' ')" \
    'install should not duplicate the pre-commit event'
  assert_equals \
    'true' \
    "$(git -C "$test_repo" config --local --get --type=bool hook.blog-ci.enabled)" \
    'install should enable the hook'
  git -C "$test_repo" hook list pre-commit --show-scope | grep -q $'local\tblog-ci' || \
    fail 'git hook list should show the local blog-ci hook'

  (cd "$test_repo" && scripts/git-hooks/uninstall.sh)
  (cd "$test_repo" && scripts/git-hooks/uninstall.sh)

  if git -C "$test_repo" config --local --get-regexp '^hook\.blog-ci\.' >/dev/null; then
    fail 'uninstall should remove blog-ci settings'
  fi
  assert_equals \
    'true' \
    "$(git -C "$test_repo" config --local --get hook.keep.command)" \
    'uninstall should preserve unrelated hooks'
}

test_pre_commit_order_and_fail_fast() {
  local test_repo="$tmp_dir/pre-commit-repo"
  local fake_bin="$test_repo/fake-bin"
  local pnpm_log="$test_repo/pnpm.log"
  git init -q "$test_repo"
  mkdir -p "$test_repo/scripts/git-hooks" "$test_repo/node_modules" "$fake_bin"
  cp "$scripts_dir/pre-commit.sh" "$test_repo/scripts/git-hooks/"

  cat >"$fake_bin/pnpm" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"$PNPM_LOG"
if [[ "${FAIL_COMMAND:-}" == "$*" ]]; then
  exit 42
fi
EOF
  chmod +x "$fake_bin/pnpm"

  (cd "$test_repo" && PNPM_LOG="$pnpm_log" PATH="$fake_bin:$PATH" \
    scripts/git-hooks/pre-commit.sh)
  assert_equals \
    $'run format:check\nrun lint\nrun build:ci' \
    "$(cat "$pnpm_log")" \
    'pre-commit should run checks in order'

  : >"$pnpm_log"
  if (cd "$test_repo" && PNPM_LOG="$pnpm_log" FAIL_COMMAND='run lint' PATH="$fake_bin:$PATH" \
    scripts/git-hooks/pre-commit.sh); then
    fail 'pre-commit should fail when lint fails'
  fi
  assert_equals \
    $'run format:check\nrun lint' \
    "$(cat "$pnpm_log")" \
    'pre-commit should stop before build after lint failure'
}

test_install_and_uninstall
test_pre_commit_order_and_fail_fast
printf 'All git hook tests passed.\n'
