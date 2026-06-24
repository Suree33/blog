# E2E テスト (Playwright)

このドキュメントでは、Playwright を使った E2E テストの構成、実行コマンド、CI での動かし方をまとめます。

## 概要

Astro のビルド結果を `astro preview` で起動し、Chromium でスモークテスト、ナビゲーション、テーマ切り替え、ビジュアルリグレッションを検証します。

テストコードは Playwright の fixture とページオブジェクトモデル (POM) で構成しています。アサーションは spec に置き、POM はページ遷移や安定したロケーターの提供に限定します。

## コマンド

- `pnpm run test:e2e`: ヘッドレスで全 E2E テストを実行
- `pnpm run test:e2e:headed`: ブラウザを表示して実行
- `pnpm run test:e2e:ui`: Playwright UI モードで実行
- `pnpm run test:e2e:update`: ビジュアルスナップショットを更新

初回実行前に Chromium が必要です。未インストールの場合は以下を実行してください。

```sh
pnpm exec playwright install chromium
```

Linux 環境でブラウザのシステム依存パッケージも入れる場合は、次のコマンドを使います。

```sh
pnpm exec playwright install --with-deps chromium
```

## ディレクトリ構成

```
playwright.config.ts          # Playwright 設定
tests/e2e/
├── components/               # UI 部品単位のロケーター
│   ├── header.ts             # <header> (banner)
│   ├── footer.ts             # <footer> (contentinfo)
│   ├── post-list.ts          # ホームの記事一覧
│   └── post-metadata.ts      # 記事メタデータ
├── pages/                    # ページオブジェクト
│   ├── home-page.ts          # ホーム (/)
│   ├── about-page.ts         # About (/about)
│   └── article-page.ts       # 記事ページ
├── fixtures/
│   └── test.ts               # 共通 fixture
├── utils/
│   ├── routes.ts             # テストで使うルート定義
│   └── regex.ts              # 正規表現ユーティリティ
├── styles/
│   └── screenshot.css        # スクリーンショット用の固定スタイル
└── specs/
    ├── smoke.spec.ts         # 基本表示の確認
    ├── navigation.spec.ts    # ヘッダー/フッターの遷移確認
    ├── theme.spec.ts         # テーマ切り替えの確認
    └── visual.spec.ts        # ビジュアルリグレッション
```

ビジュアルスナップショットは `tests/e2e/specs/visual.spec.ts-snapshots/` に保存します。`snapshotPathTemplate` で OS サフィックスを外し、プロジェクト名だけを付けます。例: `article-metadata-chromium-desktop.png`

## `playwright.config.ts` の要点

- `testDir`: `./tests/e2e/specs` を指定し、spec ファイルだけをテスト対象にします。
- `webServer`: `pnpm run build:ci && pnpm run preview` でプレビューサーバーを起動し、`http://localhost:4321/` の応答を待ってからテストを開始します。
- `build:ci`: `prebuild` による `pnpm lint` の再実行を避けるため、E2E では通常の `build` ではなく `build:ci` を使います。
- `reporter`: `list` で標準出力に進行を出し、`html` で `playwright-report/` を生成します。
- `projects`: `chromium-desktop` と `chromium-mobile` を定義します。どちらも Chromium を使用します。
- 失敗時の調査用に `trace: 'on-first-retry'`、`screenshot: 'only-on-failure'`、`video: 'retain-on-failure'` を有効にしています。
- `baseURL`: `http://localhost:4321/` に揃え、spec では `page.goto('/about')` のような相対パスを使います。

## fixture / route / POM

### `tests/e2e/fixtures/test.ts`

`@playwright/test` の `base` を拡張し、spec から以下を利用できるようにしています。

- `homePage` / `aboutPage` / `articlePage`: 対応するページオブジェクト
- `isDesktop`: viewport 幅からデスクトッププロジェクトかどうかを判定する boolean

デスクトップ限定のテストは `test.skip(({ isDesktop }) => !isDesktop, ...)` で分岐します。

### `tests/e2e/utils/routes.ts`

テストで使うルートを一箇所に集約します。URL 変更時の修正箇所を減らし、どのページをテストしているかを見通しやすくするためです。

```typescript
export const routes = {
  home: '/',
  about: '/about',
  sampleArticle: '/posts/audio-interface-under-the-desk',
} as const;

export const sampleArticleTitle = 'オーディオインターフェースを机の裏に設置した';
```

### `tests/e2e/utils/regex.ts`

`escapeRegExp` は、記事タイトルなどの動的な文字列を `RegExp` に埋め込む前にエスケープするためのヘルパーです。

`HOME_URL_REGEX` はホスト名に依存せずホーム URL (`/`) を判定するために使います。

## POM の方針

- POM は薄く保ちます。ロケーターと小さな操作だけを公開し、検証は spec 側に書きます。
- role、アクセシブル名、表示テキストなど、ユーザーに近いセマンティックロケーターを優先します。
- `data-testid` は最後の手段です。現時点ではアプリ側にテスト専用属性を追加しません。

### コンポーネント (`tests/e2e/components/`)

- `header.ts`: `root`、`blogLink`、`aboutLink`、`themeToggle` を提供します。ヘッダーにはデスクトップ用とモバイル用のリンクが両方あるため、デスクトップで表示される先頭の要素を `.first()` で選択します。
- `footer.ts`: `root`、`blogLink`、`aboutLink`、`rssLink` を提供します。
- `post-list.ts`: `<main>` 内の先頭の `<ul>` を記事一覧として扱います。Tailwind preflight により Chrome では `list` role が落ちるため、`getByRole('list')` は使いません。
- `post-metadata.ts`: `dot-separated` クラスのうち `<time>` を含む要素を記事メタデータとして扱います。

### ページオブジェクト (`tests/e2e/pages/`)

- `home-page.ts`: `goto()`、`header`、`footer`、`postList`
- `about-page.ts`: `goto()`、`header`、`footer`、`heading`
- `article-page.ts`: `goto(route, title)`、`header`、`footer`、`metadata`、`heading`

## spec の内容

### スモークテスト (`smoke.spec.ts`)

- ホーム: ページタイトルとサンプル記事リンクの表示を確認します。
- About: ページタイトルと `<h1>Daiki Sato</h1>` の表示を確認します。
- 記事: ページタイトルと記事見出しの表示を確認します。

### ナビゲーションテスト (`navigation.spec.ts`)

デスクトッププロジェクトのみで実行します。ヘッダーのナビゲーションはモバイルではメニュー内に隠れており、別の操作が必要になるためです。

- ヘッダーの `Blog` / `About` リンクで正しいページへ遷移することを確認します。
- フッターの `Blog` / `About` リンクで正しいページへ遷移することを確認します。
- フッターでは `RSS feed` リンクが表示されることも確認します。

### テーマ切り替えテスト (`theme.spec.ts`)

デスクトッププロジェクトのみで実行します。`page.emulateMedia({ colorScheme: 'light' })` でシステム配色を固定し、以下の順に確認します。

1. 初期状態では `localStorage.theme` がなく、`<html>` に `dark` / `light` クラスが付かない。
2. 1 回目のクリックで `dark` が適用される。
3. リロード後も `dark` が復元される。
4. 2 回目のクリックで `light` が適用される。
5. 3 回目のクリックでシステム設定に戻り、保存値が削除される。

### ビジュアルリグレッション (`visual.spec.ts`)

デスクトッププロジェクトのみで実行します。フルページではなくロケーター単位でスクリーンショットを撮ることで、ベースラインを小さく保ち、無関係なコンテンツ変更の影響を減らします。

- 記事メタデータ: タグと日付の余白・レイアウト崩れを検出します。
- ヘッダー: ナビゲーションとテーマトグルの見た目を確認します。
- ホームの記事リスト項目: サンプル記事リンクの表示崩れを検出します。

全スクリーンショットで `animations: 'disabled'` を指定します。また、`tests/e2e/styles/screenshot.css` を `stylePath` で注入し、日本語フォントを `Noto Sans CJK JP` に固定します。

ローカルでビジュアルテストを実行する場合も `Noto Sans CJK JP` が必要です。Ubuntu / Debian では以下でインストールできます。

```sh
sudo apt-get install fonts-noto-cjk
```

### スナップショットの更新

意図した UI 変更でベースラインを更新する場合は以下を実行し、差分をコミットしてください。

```sh
pnpm run test:e2e:update
# 個別 spec のみ更新する場合
pnpm exec playwright test tests/e2e/specs/visual.spec.ts --update-snapshots
```

## GitHub Actions

`.github/workflows/ci.yml` に `e2e` ジョブを追加しています。`lint` / `build` と同じ checkout、pnpm、Node.js、依存関係インストールのステップを YAML anchor で再利用します。

`e2e` ジョブでは以下を実行します。

1. `fonts-noto-cjk` をインストールし、スクリーンショット用の日本語フォントを固定する。
2. `pnpm exec playwright install --with-deps chromium` で Chromium と必要なシステム依存パッケージをインストールする。
3. `pnpm run test:e2e` を実行する。
4. `playwright-report/` と `test-results/` を artifact としてアップロードする。

artifact の保持期間は 7 日です。テストが失敗した場合も調査できるよう、アップロードステップには `if: ${{ !cancelled() }}` を付けています。

## 型チェック

`pnpm run lint` は `eslint && astro check && tsc --noEmit` を実行します。`astro check` は `.astro` ファイルと `src/` 配下を確認します。`tests/` 配下の TypeScript も型チェックできるように、`tsc --noEmit` を追加しています。

## gitignore

Playwright の生成物はコミットしません。

```gitignore
test-results/
playwright-report/
playwright/.cache/
blob-report/
```

## 今後の拡張候補

- モバイルのビジュアルスナップショットを追加する。
- モバイルメニューの開閉、ナビゲーション、テーマ切り替えを検証する。
- タグページ、404、目次 (TOC) の追従表示などをカバーする。
- Firefox / WebKit でも実行できるようにする。
- axe-core などでアクセシビリティチェックを追加する。
