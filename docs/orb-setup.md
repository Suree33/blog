# Amp orb セットアップ

fresh orb では、リポジトリルートの `.agents/setup` が次の開発環境を準備します。

- `.node-version` で指定した Node.js
- `package.json` の `packageManager` で指定した pnpm
- `pnpm-lock.yaml` に固定された依存関係
- Playwright E2E テスト用の Chromium、Firefox、WebKit とシステム依存関係

Node.js は pnpm の組み込み runtime 管理機能で導入します。setup は `.node-version` を
毎回読み取るため、指定バージョンを変更した後に setup が実行されると自動で追従します。
pnpm 自体は orb のプリインストール版を入口に、`packageManager` で指定した版を利用します。

setup は `$HOME/.bash_profile` に pnpm が管理する Node.js の PATH を一度だけ追加するため、
後続の Bash ログインシェルでも同じツールチェーンを利用できます。

setup は冪等であり、手動検証する場合はリポジトリルートで複数回実行できます。

```bash
.agents/setup
.agents/setup
```

`.agents/resume` は orb の起動時とスリープ復帰時に実行されます。このリポジトリには
再認証や復旧が必要なサービスがないため、現在は何も変更しません。
