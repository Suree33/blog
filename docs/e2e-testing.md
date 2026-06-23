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
├── components/               # コンポーネントレイヤー (thin POM)
│   ├── header.ts             # <header> (banner) のロケーター群
│   ├── footer.ts             # <footer> (contentinfo) のロケーター群
│   ├── post-list.ts          # ホームの記事一覧 (<ul>)
│   └── post-metadata.ts      # 記事メタデータ (タグ + 日付)
├── pages/                    # ページオブジェクト (POM)
│   ├── home-page.ts          # ホーム (/) — header / footer / postList
│   ├── about-page.ts         # About (/about) — header / footer / heading
│   └── article-page.ts       # 記事 — header / footer / metadata / heading
├── fixtures/
│   └── test.ts               # 共通 fixture (POM / isDesktop を提供)
├── utils/
│   ├── routes.ts             # ルートパスの集約 (home / about / sampleArticle)
│   └── regex.ts              # escapeRegExp ヘルパー
└── specs/
    ├── smoke.spec.ts         # スモークテスト (ホーム / About / 記事)
    ├── navigation.spec.ts    # ヘッダー/フッターのナビゲーション (desktop)
    └── theme.spec.ts         # テーマ切り替えの挙動と永続化 (desktop)
```

## 設定の要点 (`playwright.config.ts`)

- **testDir**: `./tests/e2e/specs` を指定。spec ファイルのみをテスト対象にします。
- **webServer**: `pnpm run build:ci && pnpm run preview` を起動し、`http://localhost:4321/` の応答を待ってからテストを開始します。`build:ci` を使うことで `prebuild` (`pnpm lint`) の再実行を避け、E2E 実行時の lint 二重実行を防ぎます。ローカルでは既存サーバーを再利用し (`reuseExistingServer: !process.env.CI`)、CI では必ず新規起動します。
- **reporter**: `[['list'], ['html']]` を指定します。`list` が標準出力に進行を出力し (CI で見やすい)、`html` が `playwright-report/` に HTML レポートを生成します。
- **browser**: Phase 1 は Chromium のみ。
- **projects**: デスクトップ (`Desktop Chrome`) とモバイル (`Pixel 5`) の2プロジェクトを定義します。どちらも Chromium を使用します。
- **証跡**: CI 失敗時の解析用に `trace: 'on-first-retry'`、`screenshot: 'only-on-failure'`、`video: 'retain-on-failure'` を設定しています。
- **baseURL**: `http://localhost:4321/` (末尾スラッシュ付き) を設定し、spec では `page.goto('/about')` のように相対パスを使えます。`webServer.url` も同じ値に揃えています。

## fixture / route / POM 基盤

### `tests/e2e/fixtures/test.ts`

`@playwright/test` の `base` を拡張し、以下の fixture を提供します。spec はここから `test` / `expect` を import します。

- `homePage` / `aboutPage` / `articlePage`: 対応するページオブジェクトを `page` から生成して提供します。
- `isDesktop`: `page.viewportSize()` からデスクトッププロジェクトかを判定する真偽値。spec は `test.skip(({ isDesktop }) => !isDesktop, ...)` でデスクトップ専用スコープを作れます。

今後のフェーズで axe などのカスタム fixture を追加する際も、このファイルが拡張点になります。

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

動的文字列から `RegExp` を構築する際のエスケープヘルパー `escapeRegExp` と、ホーム URL 判定用の named constant `HOME_URL_REGEX` (ホスト非依存) を提供します。記事タイトルなど regex メタ文字を含みうる値を `RegExp` に埋め込む際に `escapeRegExp` を使用します。

## POM / コンポーネントレイヤーの設計方針

Phase 2 で thin な Page Object Model (POM) を導入しました。方針は以下の通りです。

- **thin を保つ**: コンポーネントクラスは安定したロケーターと小さな操作 (`gotoAbout()` / `toggleTheme()` など) のみを公開し、アサーションは隠さず spec 側に置きます。
- **セマンティックロケーター優先**: role・アクセシブル名・テキスト・安定したルート定数を使います。DOM 構造 (`ul > li > a` など) への依存を避けます。
- **data-testid は最後の手段**: セマンティックロケーターが存在しない場合のみクラス等のフォールバックを使い、Phase 2 ではアプリ側に `data-testid` を追加しません。

### コンポーネント (`tests/e2e/components/`)

各クラスは対応する UI 部位のロケーターを公開します。`page` を public readonly で保持し、ページレベルのアサーション (`expect(homePage.page).toHaveTitle(...)`) も spec 側から書けます。

- `header.ts`: `root` (`banner`)・`blogLink`・`aboutLink`・`themeToggle`。ヘッダーはデスクトップ/モバイルメニューの両方にナビ link とトグルをレンダリングするため、デスクトップ側を `.first()` で確定します。モバイルのハンバーガートリガーはセマンティック role を持たない `<div>` であり、Phase 2 ではロケーターを公開していません (Phase 3 でアプリ側のアクセシビリティ整備後に追加する想定)。
- `footer.ts`: `root` (`contentinfo`)・`blogLink`・`aboutLink`・`rssLink` (`aria-label="RSS feed"`)。
- `post-list.ts`: `root` は `<main>` 内の `<ul>`。Tailwind preflight の `list-style: none` で Chrome が `list` role を落とすため `getByRole('list')` は使わず `main` ランドマーク + `ul` セレクターで特定します。汎用ヘルパー `articleLink(title)` で任意の記事リンクを取得でき、`sampleArticleLink` はそれに `sampleArticleTitle` を渡す convenience です。
- `post-metadata.ts`: メタデータ `<div>` は role/aria-label を持たないため、`dot-separated` クラスのうち `<time>` を含むものを `root` とします。`pubDate`・`tagLinks`・`text()` を公開し、ビジュアルテストにも再利用できるようにしています。

### ページオブジェクト (`tests/e2e/pages/`)

- `home-page.ts`: `goto()` + `header` / `footer` / `postList`。
- `about-page.ts`: `goto()` + `header` / `footer` / `heading` (`<h1>Daiki Sato</h1>`)。
- `article-page.ts`: `goto(route = routes.sampleArticle, title = sampleArticleTitle)` + `header` / `footer` / `metadata` / `heading`。`title` は `heading` ロケーターが使う期待値を内部管理し、他の記事もルートとタイトルを渡してテストできます。

## スモークテストの内容 (`smoke.spec.ts`)

Phase 2 で POM fixture を使うようにリファクタリング済みです。

1. **ホーム**: `homePage.goto()` 後、ページタイトルと `homePage.postList.sampleArticleLink` の可視性を検証します。
2. **About**: `aboutPage.goto()` 後、ページタイトルと `aboutPage.heading` を検証します。
3. **記事**: `articlePage.goto()` 後、ページタイトル (`escapeRegExp` でエスケープ) と `articlePage.heading` を検証します。

## ナビゲーションテスト (`navigation.spec.ts`)

デスクトッププロジェクト限定 (`test.skip(({ isDesktop }) => !isDesktop, ...)`)。モバイルではヘッダーのナビ link がハンバーガーメニュー内に隠れるため、このフェーズではモバイルの複雑さを避けます。

- ヘッダー `Blog` / `About` link とフッター `Blog` / `About` link をクリックし、遷移先 URL を検証します。フッターのテストでは `footer.rssLink` の可視性も検証します。
- ホーム判定は `HOME_URL_REGEX` (`utils/regex.ts`、ホスト非依存)、About 判定は `/\/about\/?$/` で trailing slash 両対応にします。

## テーマ切り替えテスト (`theme.spec.ts`)

デスクトッププロジェクト限定。システム配色を `page.emulateMedia({ colorScheme: 'light' })` で固定し、3 状態のトグルサイクルを決定的に検証します。

1. 初期状態: 新規コンテキストのため `localStorage.theme` は無く `<html>` に `dark`/`light` クラス無し。
2. 1 クリック目: システム=light のため `dark` を適用。`<html>` の `class` と `localStorage.theme` を検証。
3. リロードで永続化を検証: `BaseLayout` のインラインスクリプトが `localStorage` から `dark` を復元。
4. 2 クリック目: `dark` → `light`。5. 3 クリック目: `light` → システム (クリア)。

`<html>` のクラスは `toHaveAttribute('class', /.../)`、`localStorage` は `expect.poll` で検証します。

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

Phase 2 では thin POM とナビゲーション/テーマの挙動テストを追加しました。以降のフェーズで以下を段階的に追加する想定です。

- **ビジュアルリグレッション**: `expect(page).toHaveScreenshot()` によるスクリーンショット比較を主要ページに追加。`PostMetadata.root` などのロケーターはこのための準備済み。
- **モバイルメニュー**: ハンバーガーメニュー開閉後のナビゲーション/テーマトグルをモバイルプロジェクトで検証。ただし現在のハンバーガートリガーは `<div class="hamburger">` でセマンティック role/アクセシブル名を持たないため、先にアプリ側で `<button>` + `aria-label` / `aria-expanded` のアクセシビリティ整備が必要です。
- **テストカバレッジの拡充**: タグページ、404、目次 (TOC) のスクロール追従などのシナリオを追加。
- **CI 連携**: GitHub Actions 上で Playwright を実行するワークフローを追加 (別フェーズで対応)。
- **アクセシビリティ**: axe-core などを fixture に組み込み、a11y チェックを統合。
