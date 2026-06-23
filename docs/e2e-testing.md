# E2E テスト (Playwright)

このドキュメントでは、Playwright による E2E テストの構成・コマンド・ディレクトリ構造、および今後の拡張方針を説明します。

## 概要

Astro ブログの静的生成結果を `astro preview` でサーブし、Chromium でスモークテストを実行します。Phase 1 では最小限の fixture / route 基盤のみを導入し、以降のフェーズで Page Object Model (POM) やビジュアルリグレッションテストへ段階的に拡張することを想定しています。

## コマンド

| コマンド | 内容 |
|----------|------|
| `pnpm run test:e2e` | ヘッドレスで全 E2E テストを実行 |
| `pnpm run test:e2e:headed` | ブラウザを開いた状態で実行 |
| `pnpm run test:e2e:ui` | Playwright UI モードで実行 (テストごとの再実行・ウォッチ) |

初回実行前に Chromium のバイナリが必要です。不足している場合は以下を実行してください。

```sh
pnpm exec playwright install chromium
```

## ディレクトリ構造

```
playwright.config.ts          # Playwright 設定 (testDir / webServer / projects)
tests/e2e/
├── fixtures/
│   └── test.ts               # test / expect を再エクスポートする共通 fixture
├── utils/
│   └── routes.ts             # ルートパスの集約 (home / about / sampleArticle)
└── specs/
    └── smoke.spec.ts         # スモークテスト (ホーム / About / 記事)
```

## 設定の要点 (`playwright.config.ts`)

- **testDir**: `./tests/e2e/specs` を指定。spec ファイルのみをテスト対象にします。
- **webServer**: `pnpm run build:ci && pnpm run preview` を起動し、`http://localhost:4321/` の応答を待ってからテストを開始します。`build:ci` を使うことで `prebuild` (`pnpm lint`) の再実行を避け、E2E 実行時の lint 二重実行を防ぎます。ローカルでは既存サーバーを再利用し (`reuseExistingServer: !process.env.CI`)、CI では必ず新規起動します。
- **reporter**: `[['list'], ['html']]` を指定します。`list` が標準出力に進行を出力し (CI で見やすい)、`html` が `playwright-report/` に HTML レポートを生成します。
- **browser**: Phase 1 は Chromium のみ。
- **projects**: デスクトップ (`Desktop Chrome`) とモバイル (`Pixel 5`) の2プロジェクトを定義します。どちらも Chromium を使用します。
- **証跡**: CI 失敗時の解析用に `trace: 'on-first-retry'`、`screenshot: 'only-on-failure'`、`video: 'retain-on-failure'` を設定しています。
- **baseURL**: `http://localhost:4321/` (末尾スラッシュ付き) を設定し、spec では `page.goto('/about')` のように相対パスを使えます。`webServer.url` も同じ値に揃えています。

## fixture / route 基盤

### `tests/e2e/fixtures/test.ts`

`@playwright/test` の `test` と `expect` を再エクスポートします。spec はここから import します。今後のフェーズで `base` を拡張して POM や axe などのカスタム fixture を追加する際の拡張点になります。

### `tests/e2e/utils/routes.ts`

ルートパスを一箇所に集約します。URL 変更への耐性と、テストカバレッジの対象を可視化するのが目的です。

```typescript
export const routes = {
  home: '/',
  about: '/about',
  sampleArticle: '/posts/audio-interface-under-the-desk',
} as const;

export const sampleArticleTitle = 'オーディオインターフェースを机の裏に設置した';
```

### `tests/e2e/utils/regex.ts`

動的文字列から `RegExp` を構築する際のエスケープヘルパー `escapeRegExp` を提供します。記事タイトルなど regex メタ文字を含みうる値を `RegExp` に埋め込む際に使用します。

## スモークテストの内容 (`smoke.spec.ts`)

1. **ホーム**: ページタイトルと、サンプル記事へのリンク (`getByRole('link', { name: sampleArticleTitle })`) が表示されることを検証します。DOM 構造 (`ul > li > a` 等) に依存しないセマンティックロケーターを使用します。
2. **About**: ページタイトルと `<h1>Daiki Sato</h1>` が表示されることを検証します。
3. **記事**: サンプル記事のタイトルと `<h1>` が表示されることを検証します。タイトルの `RegExp` は `escapeRegExp` でエスケープした上で構築します。

## 型チェック

`pnpm run lint` は `eslint && astro check && tsc --noEmit` を実行します。`astro check` は `.astro` ファイルと `src/` 配下を対象にしますが `tests/` は対象外のため、`tsc --noEmit` を追加して `tests/` 配下の TypeScript ファイルも型チェックされるようにしています。

## gitignore

Playwright の生成物はコミット対象外です。

```
test-results/
playwright-report/
playwright/.cache/
blob-report/
```

## 今後の拡張方針

Phase 1 は最小基盤のみを導入します。以降のフェーズで以下を段階的に追加する想定です。

- **Page Object Model**: ページごとの操作・アサーションをカプセル化する POM クラスを `tests/e2e/pages/` に配置し、`fixtures/test.ts` 経由で fixture として提供。
- **ビジュアルリグレッション**: `expect(page).toHaveScreenshot()` によるスクリーンショット比較を主要ページに追加。
- **テストカバレッジの拡充**: ナビゲーション、テーマ切り替え、タグページ、404 などのシナリオを追加。
- **CI 連携**: GitHub Actions 上で Playwright を実行するワークフローを追加 (別フェーズで対応)。
- **アクセシビリティ**: axe-core などを fixture に組み込み、a11y チェックを統合。
