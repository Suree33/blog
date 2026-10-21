# Amp orb セットアップ

fresh orb では、リポジトリルートの `.agents/setup` が次の開発環境を準備します。

- `package.json` の `devEngines.runtime` で指定した Node.js
- `package.json` の `packageManager` で指定した pnpm
- `pnpm-lock.yaml` に固定された依存関係
- Playwright E2E テスト用の Chromium、Firefox、WebKit とシステム依存関係

Node.js と pnpm は pnpm 自身が管理します。setup は orb のプリインストール版 pnpm を
入口に、`packageManager` で指定した版へ切り替わります。`pnpm install` が
`devEngines.runtime` の Node.js を導入し、`pnpm run` はその Node.js でスクリプトを
実行します。指定バージョンを変更した後に setup が実行されると自動で追従します。

setup は `$HOME/.bash_profile` に pnpm の PATH を一度だけ追加するため、
後続の Bash ログインシェルでも同じ pnpm を利用できます。

前提として、orb にプリインストールされた pnpm は `packageManager` を読んで宣言版へ
自動で切り替わる必要があります。古い pnpm が入口になる場合は、この前提を満たす版を
orb 側で用意してください。

setup は冪等であり、手動検証する場合はリポジトリルートで複数回実行できます。

```bash
.agents/setup
.agents/setup
```

`.agents/resume` は orb の起動時とスリープ復帰時に実行されます。このリポジトリには
再認証や復旧が必要なサービスがないため、現在は何も変更しません。
