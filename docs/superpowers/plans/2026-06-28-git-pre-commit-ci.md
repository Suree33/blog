# Git pre-commit CI Checks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Git 2.54 の設定ベース pre-commit hook で formatting、lint、build を逐次実行し、clone ごとに安全に導入・解除できるようにする。

**Architecture:** リポジトリ内の3つの Bash スクリプトへ実行、導入、解除の責務を分離する。Git config には `blog-ci` という名前でローカル登録し、実際の品質チェックは既存の pnpm scripts を再利用する。シェル統合テストでは一時リポジトリと偽の `pnpm` を使い、設定変更と fail-fast を外部依存なしで検証する。

**Tech Stack:** Git 2.54、Bash、pnpm、Prettier、ESLint、Astro Check、TypeScript、Astro build

---

## File structure

- Create `scripts/git-hooks/pre-commit.sh`: pre-commit の依存確認と品質チェック実行。
- Create `scripts/git-hooks/install.sh`: Git バージョン確認と `hook.blog-ci` の冪等登録。
- Create `scripts/git-hooks/uninstall.sh`: `hook.blog-ci` だけを冪等に削除。
- Create `tests/git-hooks/hooks.test.sh`: 一時 Git リポジトリを使うシェル統合テスト。
- Modify `package.json`: hook の install、uninstall、test scripts を公開。
- Create `docs/git-hooks.md`: 利用方法、実行範囲、CI/Copilot hook との差を説明。
- Modify `docs/ci-scripts.md`: pre-commit と CI の分担を追記。

### Task 1: Add failing integration tests

**Files:**
- Create: `tests/git-hooks/hooks.test.sh`

- [ ] **Step 1: Write the shell integration tests**

```bash
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

  "$test_repo/scripts/git-hooks/install.sh"
  "$test_repo/scripts/git-hooks/install.sh"

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

  "$test_repo/scripts/git-hooks/uninstall.sh"
  "$test_repo/scripts/git-hooks/uninstall.sh"

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

  PNPM_LOG="$pnpm_log" PATH="$fake_bin:$PATH" \
    "$test_repo/scripts/git-hooks/pre-commit.sh"
  assert_equals \
    $'run format:check\nrun lint\nrun build:ci' \
    "$(cat "$pnpm_log")" \
    'pre-commit should run checks in order'

  : >"$pnpm_log"
  if PNPM_LOG="$pnpm_log" FAIL_COMMAND='run lint' PATH="$fake_bin:$PATH" \
    "$test_repo/scripts/git-hooks/pre-commit.sh"; then
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
```

- [ ] **Step 2: Make the test executable**

Run: `chmod +x tests/git-hooks/hooks.test.sh`

- [ ] **Step 3: Run the test to verify it fails**

Run: `bash tests/git-hooks/hooks.test.sh`

Expected: FAIL because `scripts/git-hooks/*.sh` do not exist.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/git-hooks/hooks.test.sh
git commit -m "test: Git hookの統合テストを追加"
```

### Task 2: Implement the Git hook scripts

**Files:**
- Create: `scripts/git-hooks/pre-commit.sh`
- Create: `scripts/git-hooks/install.sh`
- Create: `scripts/git-hooks/uninstall.sh`

- [ ] **Step 1: Implement the pre-commit runner**

```bash
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
```

- [ ] **Step 2: Implement the idempotent installer**

```bash
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
```

- [ ] **Step 3: Implement the idempotent uninstaller**

```bash
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
```

- [ ] **Step 4: Make scripts executable and verify syntax**

Run: `chmod +x scripts/git-hooks/*.sh && bash -n scripts/git-hooks/*.sh tests/git-hooks/hooks.test.sh`

Expected: exit 0 with no output.

- [ ] **Step 5: Run integration tests**

Run: `bash tests/git-hooks/hooks.test.sh`

Expected: `All git hook tests passed.`

- [ ] **Step 6: Commit the implementation**

```bash
git add scripts/git-hooks/pre-commit.sh scripts/git-hooks/install.sh scripts/git-hooks/uninstall.sh
git commit -m "feat: Git 2.54のpre-commit hookを追加"
```

### Task 3: Expose commands and document usage

**Files:**
- Modify: `package.json`
- Create: `docs/git-hooks.md`
- Modify: `docs/ci-scripts.md`

- [ ] **Step 1: Add package scripts**

Add the following entries to `package.json` after `lint`:

```json
"hooks:install": "bash scripts/git-hooks/install.sh",
"hooks:uninstall": "bash scripts/git-hooks/uninstall.sh",
"test:git-hooks": "bash tests/git-hooks/hooks.test.sh",
```

- [ ] **Step 2: Create the Git hooks guide**

Create `docs/git-hooks.md`:

```markdown
# Git hooks

Git 2.54 で追加された設定ベース hook を使い、コミット前に CI 相当の静的チェックとビルドを実行します。

## 前提

- Git 2.54 以上
- pnpm
- `pnpm install --frozen-lockfile` による依存関係のインストール

## 導入

clone ごとに一度、次を実行します。

\`\`\`bash
pnpm run hooks:install
\`\`\`

登録状態は次のコマンドで確認できます。

\`\`\`bash
git hook list pre-commit --show-scope
\`\`\`

`local` scope の `blog-ci` が表示されれば導入済みです。設定はローカルの `.git/config` に保存されるため、clone 時には自動継承されません。

## 実行内容

`git commit` の直前に、次を逐次実行します。

1. `pnpm run format:check`
2. `pnpm run lint`
3. `pnpm run build:ci`

最初の失敗で処理を終了し、コミットを中止します。検査対象はステージ済みファイルだけでなく作業ツリー全体です。Playwright E2E は実行時間とブラウザ・フォント依存が大きいため、GitHub Actions だけで実行します。

## 無効化と解除

この clone で一時的に無効化する場合:

\`\`\`bash
git config --local hook.blog-ci.enabled false
\`\`\`

再度有効化する場合:

\`\`\`bash
git config --local hook.blog-ci.enabled true
\`\`\`

登録を削除する場合:

\`\`\`bash
pnpm run hooks:uninstall
\`\`\`

緊急時は `git commit --no-verify` で1回だけ回避できますが、品質チェックを省略するため常用しません。

## GitHub Copilot CLI hooks との違い

この機能は Git 自身が `git commit` 時に実行する hook です。`.github/hooks/*.json` で設定する GitHub Copilot CLI の lifecycle hook とは独立しており、Copilot CLI を使わないコミットでも実行されます。
```

- [ ] **Step 3: Update the CI scripts guide**

Append to `docs/ci-scripts.md`:

```markdown
## Git pre-commit

Git 2.54 の設定ベース pre-commit hook では、CI のうち次のチェックを逐次実行します。

1. `pnpm run format:check`
2. `pnpm run lint`
3. `pnpm run build:ci`

Playwright E2E はブラウザとフォントの環境準備が必要で実行時間も長いため、pre-commit には含めず GitHub Actions で実行します。導入方法は [Git hooks](./git-hooks.md) を参照してください。
```

- [ ] **Step 4: Format and run focused tests**

Run: `pnpm exec prettier --write package.json docs/git-hooks.md docs/ci-scripts.md tests/git-hooks/hooks.test.sh scripts/git-hooks/*.sh && pnpm run test:git-hooks`

Expected: Prettier completes and `All git hook tests passed.` is printed.

- [ ] **Step 5: Commit commands and documentation**

```bash
git add package.json docs/git-hooks.md docs/ci-scripts.md tests/git-hooks/hooks.test.sh
git commit -m "docs: Git hookの導入手順を追加"
```

### Task 4: Install and verify the hook end to end

**Files:**
- Modify local-only: `.git/config`

- [ ] **Step 1: Install the hook in this clone**

Run: `pnpm run hooks:install`

Expected: `local` scope の `blog-ci` が表示される。

- [ ] **Step 2: Verify registration is unique**

Run: `pnpm run hooks:install && git config --local --get-all hook.blog-ci.event`

Expected: `pre-commit` が1行だけ表示される。

- [ ] **Step 3: Run the real pre-commit checks**

Run: `git hook run pre-commit`

Expected: `format:check`、`lint`、`build:ci` が順番に成功する。

- [ ] **Step 4: Run repository verification**

Run: `pnpm run test:git-hooks && pnpm run lint && pnpm run format:check`

Expected: all commands exit 0.

- [ ] **Step 5: Inspect final changes**

Run: `git status --short && git diff --check HEAD`

Expected: ユーザーが編集した設計書以外に未コミット変更がなく、whitespace error がない。
