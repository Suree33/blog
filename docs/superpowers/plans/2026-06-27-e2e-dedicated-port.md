# E2E Dedicated Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Playwright E2E テストを通常の Astro 開発サーバーと競合しない `localhost:4322` で実行する。

**Architecture:** `playwright.config.ts` に E2E ポートとベース URL の単一の定義を置き、ブラウザーの `baseURL`、Web サーバーの待受確認 URL、Astro Preview の起動引数から共有する。通常の開発サーバーが使う `4321` は変更しない。

**Tech Stack:** Astro 7、TypeScript、Playwright、pnpm

---

### Task 1: Playwright を E2E 専用ポートへ分離する

**Files:**
- Modify: `playwright.config.ts:1-61`

- [ ] **Step 1: 変更前の設定契約が失敗することを確認する**

Run:

```bash
rg -q "const e2ePort = 4322" playwright.config.ts
```

Expected: exit code `1`。E2E 専用ポートの定義はまだ存在しない。

- [ ] **Step 2: ポートとベース URL を単一箇所に定義する**

`playwright.config.ts` の import 直後へ追加する。

```ts
const e2ePort = 4322;
const e2eBaseURL = `http://localhost:${e2ePort}/`;
```

同じファイルの設定を次のように変更する。

```ts
use: {
  baseURL: e2eBaseURL,
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

```ts
webServer: {
  command: `pnpm run build:ci && pnpm run preview --port ${e2ePort}`,
  url: e2eBaseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 180 * 1000,
},
```

- [ ] **Step 3: 設定契約が成功することを確認する**

Run:

```bash
rg -q "const e2ePort = 4322" playwright.config.ts
pnpm exec playwright test --list
```

Expected: 両コマンドが exit code `0`。Playwright は 102 テストを検出する。

### Task 2: E2E ドキュメントを更新して動作を検証する

**Files:**
- Modify: `docs/e2e-testing.md`

- [ ] **Step 1: E2E サーバー説明を専用ポートへ更新する**

`docs/e2e-testing.md` の `playwright.config.ts` 解説を次の内容へ変更する。

```markdown
- `webServer`: `pnpm run build:ci && pnpm run preview --port 4322` でプレビューサーバーを起動し、E2E 専用の `http://localhost:4322/` の応答を待ってからテストを開始します。通常の開発サーバーが使う `4321` とは競合しません。
```

`baseURL` の説明も次の内容へ変更する。

```markdown
- `baseURL`: E2E 専用の `http://localhost:4322/` に揃え、spec では `page.goto('/about')` のような相対パスを使います。
```

- [ ] **Step 2: 開発サーバーと並行して E2E を実行する**

既存の `astro dev --host` が `4321` で起動したまま、次を実行する。

```bash
pnpm run test:e2e
```

Expected: Playwright が `4322` で Astro Preview を起動し、全テストが成功する。`astro-dev-toolbar` によるクリック阻害は発生しない。

- [ ] **Step 3: lint を実行する**

Run:

```bash
pnpm run lint
```

Expected: exit code `0`。ESLint、Astro check、TypeScript check がすべて成功する。

- [ ] **Step 4: 実装をコミットする**

```bash
git add playwright.config.ts docs/e2e-testing.md docs/superpowers/plans/2026-06-27-e2e-dedicated-port.md
git commit -m "test: E2Eテストを専用ポートで実行"
```
