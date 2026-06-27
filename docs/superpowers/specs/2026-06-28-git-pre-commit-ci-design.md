# Git pre-commit CI チェック設計

## 背景

Git 2.54 では、従来の `$GIT_DIR/hooks/<event>` に加えて、Git config の `hook.<name>.event` と `hook.<name>.command` から複数の hook を登録できるようになった。登録済み hook は `git hook list <event> --show-scope` で確認でき、個別に無効化できる。

このリポジトリでは GitHub Actions が formatting、lint、build、Playwright E2E を実行している。コミット前に高速な CI 相当チェックを行い、明らかな失敗を早期に検出する。一方、環境準備と実行時間が大きい E2E は CI に残す。

参考資料:

- [git-hook 2.54 documentation](https://git-scm.com/docs/git-hook)
- [githooks documentation](https://git-scm.com/docs/githooks)
- [Highlights from Git 2.54](https://github.blog/open-source/git/highlights-from-git-2-54/)

## 目的

- Git 2.54 の設定ベース hook を使って pre-commit チェックを登録する。
- コミット前に formatting、lint、build の失敗を検出する。
- hook の設定を各 clone へ安全かつ再現可能に導入・解除できるようにする。
- GitHub Actions を最終的な品質保証として維持する。

## 対象外

- Playwright E2E を pre-commit で実行すること。
- ステージ済みファイルだけを隔離して検査すること。
- Git 2.53 以前をサポートすること。
- hook 内で依存関係や Playwright ブラウザを自動インストールすること。

## 採用方式

Git 2.54 の設定ベース hook と、リポジトリにコミットするシェルスクリプトを組み合わせる。

従来の `core.hooksPath` は新しい複数 hook 機構を活用できないため採用しない。Husky、lefthook、pre-commit framework などの追加ツールも、このリポジトリの規模に対して依存関係と設定が増えるため導入しない。

## 構成

### `scripts/git-hooks/pre-commit.sh`

pre-commit から呼び出す実行本体とする。リポジトリルートで次を順番に実行し、いずれかが失敗した時点で非ゼロ終了する。

1. `pnpm run format:check`
2. `pnpm run lint`
3. `pnpm run build:ci`

各処理の開始を標準出力へ表示し、失敗箇所を特定しやすくする。実行前に `pnpm` と `node_modules` の存在を確認する。準備されていない場合は `pnpm install --frozen-lockfile` を案内して終了する。

このスクリプトは作業ツリー全体を検査する。未ステージ変更も結果へ影響することを仕様とし、ステージ済みスナップショットを作る処理は実装しない。

### `scripts/git-hooks/install.sh`

以下を行う冪等な導入スクリプトとする。

1. Git リポジトリ内であることを確認する。
2. Git 2.54 以上であることを確認する。
3. ローカル Git config に `hook.blog-ci.command` を登録する。
4. `hook.blog-ci.event` に `pre-commit` を重複なく登録する。
5. `hook.blog-ci.enabled` を `true` にする。
6. `git hook list pre-commit --show-scope` で登録結果を表示する。

hook 名は他の設定と衝突しにくく、用途が分かる `blog-ci` とする。command はリポジトリ内の `scripts/git-hooks/pre-commit.sh` を参照する。

### `scripts/git-hooks/uninstall.sh`

ローカル Git config の `hook.blog-ci` セクションだけを削除する。他の設定ベース hook や従来の hook ファイルには触れない。未登録の状態でも正常終了する冪等な処理とする。

### `package.json`

次の npm scripts を追加する。

- `hooks:install`: 導入スクリプトを実行する。
- `hooks:uninstall`: 解除スクリプトを実行する。

pre-commit の品質チェックは実行本体に明示し、GitHub Actions の並列 job 構成は変更しない。

## 実行フロー

1. 開発者が clone ごとに一度 `pnpm run hooks:install` を実行する。
2. `git commit` が Git の `pre-commit` event を発火する。
3. Git が設定ベースの `blog-ci` hook を実行する。
4. formatting、lint、build がすべて成功すればコミットを続行する。
5. いずれかが失敗すれば hook が非ゼロ終了し、Git がコミットを中止する。
6. GitHub Actions は従来どおり全チェックと E2E を実行する。

Git 2.54 の仕様により、設定ベース hook は config で検出された順に実行され、従来の `$GIT_DIR/hooks/pre-commit` は最後に実行される。本機能は他の hook を上書きしない。

## 無効化と回避

- 一時的に1回だけ回避する: `git commit --no-verify`
- この clone で無効化する: `git config --local hook.blog-ci.enabled false`
- 再度有効化する: `git config --local hook.blog-ci.enabled true`
- 登録を削除する: `pnpm run hooks:uninstall`

`--no-verify` は品質チェックを省略するため、緊急時の回避手段としてのみドキュメント化する。

## エラー処理

- Git バージョン不足: 必要な最低バージョンと現在のバージョンを表示し、設定を変更せず終了する。
- Git リポジトリ外: 対象リポジトリで実行するよう案内し、終了する。
- `pnpm` 不在: `pnpm` の準備が必要であることを表示し、コミットを中止する。
- `node_modules` 不在: `pnpm install --frozen-lockfile` を案内し、コミットを中止する。
- formatting、lint、build の失敗: 元コマンドの出力をそのまま表示し、最初の失敗で終了する。

## 検証

1. `bash -n` で3つのシェルスクリプトの構文を確認する。
2. 一時 Git リポジトリで install を2回実行し、`blog-ci` が重複しないことを確認する。
3. `git hook list pre-commit --show-scope` に local scope の `blog-ci` が1件表示されることを確認する。
4. `git hook run pre-commit` を実行し、formatting、lint、build が成功することを確認する。
5. uninstall 後に `blog-ci` が消え、別の hook 設定が維持されることを確認する。
6. リポジトリの必須検証として `pnpm run lint` を実行する。

## ドキュメント

`docs/git-hooks.md` を追加し、次を説明する。

- Git 2.54 以上という前提
- 導入、解除、一時無効化、再有効化の手順
- pre-commit の実行内容と実行順
- 作業ツリー全体が検査対象になること
- E2E を GitHub Actions に残す理由
- `--no-verify` の位置づけ
- GitHub Copilot CLI hooks との違い

`docs/ci-scripts.md` には、pre-commit が既存 CI の formatting、lint、build 相当を実行し、E2E は含まないことを追記する。
