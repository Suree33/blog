# axe-core Accessibility E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ホーム、About、代表記事をデスクトップ／モバイル、ライト／ダークで axe-core により検査し、`serious` / `critical` の違反を既存 Playwright CI で検出する。

**Architecture:** `@axe-core/playwright` を明示的な開発依存へ追加し、専用の `accessibility.spec.ts` に対象 project の制御、テーマ別のページ再読込、モバイルメニュー展開、全結果の JSON 添付、重大違反の集約を閉じ込める。既存 POM と fixture をそのまま利用し、Playwright 設定や GitHub Actions のジョブは増やさない。

**Tech Stack:** Astro 7、TypeScript 6、Playwright 1.61、@axe-core/playwright 4.12、pnpm 11

---

## File structure

- Modify: `package.json` — `@axe-core/playwright` を直接利用する devDependency として宣言する。
- Modify: `pnpm-lock.yaml` — CI で利用する `@axe-core/playwright` と対応する `axe-core` の解決済みバージョンを固定する。
- Create: `tests/e2e/specs/accessibility.spec.ts` — 対象3ページのテーマ別スキャン、JSON添付、重大度フィルター、対象projectのskipを担当する。
- Modify: `docs/e2e-testing.md` — 検査行列、失敗条件、レポートの見方、自動検査の限界を記録する。

### Task 1: Playwright向けaxe-core依存を追加する

**Files:**
- Modify: `package.json:47-65`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: 直接依存がまだ存在しないことを確認する**

Run:

```bash
node -e "const pkg = require('./package.json'); process.exit(pkg.devDependencies?.['@axe-core/playwright'] ? 0 : 1)"
```

Expected: exit code `1`。`axe-core` は推移依存として lockfile に存在するが、テストから利用する `@axe-core/playwright` は直接依存にない。

- [ ] **Step 2: `@axe-core/playwright` をdevDependencyへ追加する**

Run:

```bash
pnpm add --save-dev @axe-core/playwright
```

Expected: exit code `0`。`package.json` の `devDependencies` に `"@axe-core/playwright": "^4.12.1"` が追加され、`pnpm-lock.yaml` に importer と解決済みパッケージが記録される。

- [ ] **Step 3: 直接依存とモジュール解決を確認する**

Run:

```bash
node -e "const pkg = require('./package.json'); if (!pkg.devDependencies?.['@axe-core/playwright']) process.exit(1)"
pnpm exec node --input-type=module -e "import AxeBuilder from '@axe-core/playwright'; if (typeof AxeBuilder !== 'function') process.exit(1)"
```

Expected: 両コマンドが exit code `0`。

- [ ] **Step 4: 依存追加をコミットする**

```bash
git add package.json pnpm-lock.yaml
git commit -m "test: axe-coreのPlaywright連携を追加"
```

### Task 2: axeスキャンの共通処理とホームページ検査を追加する

**Files:**
- Create: `tests/e2e/specs/accessibility.spec.ts`

- [ ] **Step 1: 専用specが未作成であることを確認する**

Run:

```bash
pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts --list
```

Expected: exit code `1`、`Error: No tests found`。アクセシビリティ専用specはまだ存在しない。

- [ ] **Step 2: テーマ別スキャンヘルパーとホームページテストを作成する**

`tests/e2e/specs/accessibility.spec.ts` を次の内容で作成する。

```ts
import AxeBuilder from '@axe-core/playwright';
import { type Page, type TestInfo } from '@playwright/test';
import { expect, test } from '../fixtures/test';

const SUPPORTED_PROJECTS = new Set(['chromium', 'Mobile Chrome']);
const MOBILE_PROJECT = 'Mobile Chrome';
const THEMES = ['light', 'dark'] as const;
const BLOCKING_IMPACTS = ['serious', 'critical'] as const;

type Theme = (typeof THEMES)[number];
type BlockingImpact = (typeof BLOCKING_IMPACTS)[number];
type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>;
type AxeTarget = AxeResults['violations'][number]['nodes'][number]['target'];

interface BlockingViolation {
  theme: Theme;
  ruleId: string;
  impact: BlockingImpact;
  target: AxeTarget;
}

interface ScanPageOptions {
  page: Page;
  testInfo: TestInfo;
  goto: () => Promise<void>;
  openMobileMenu: () => Promise<void>;
}

function skipUnsupportedProject(testInfo: TestInfo): void {
  test.skip(
    !SUPPORTED_PROJECTS.has(testInfo.project.name),
    'axe検査はchromiumとMobile Chromeのみで実行',
  );
}

function isBlockingImpact(
  impact: string | null | undefined,
): impact is BlockingImpact {
  return BLOCKING_IMPACTS.some((candidate) => candidate === impact);
}

async function scanPageForAccessibility({
  page,
  testInfo,
  goto,
  openMobileMenu,
}: ScanPageOptions): Promise<void> {
  const blockingViolations: BlockingViolation[] = [];
  const isMobile = testInfo.project.name === MOBILE_PROJECT;

  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });
    await goto();

    if (isMobile) {
      await openMobileMenu();
    }

    const results = await new AxeBuilder({ page }).analyze();

    await testInfo.attach(`axe-results-${theme}.json`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    for (const violation of results.violations) {
      const { impact } = violation;
      if (!isBlockingImpact(impact)) {
        continue;
      }

      for (const node of violation.nodes) {
        blockingViolations.push({
          theme,
          ruleId: violation.id,
          impact,
          target: node.target,
        });
      }
    }
  }

  expect(
    blockingViolations,
    'seriousまたはcriticalのアクセシビリティ違反',
  ).toEqual([]);
}

test.describe('axe-coreアクセシビリティ検査', () => {
  test('ホーム', async ({ homePage }, testInfo) => {
    skipUnsupportedProject(testInfo);

    await scanPageForAccessibility({
      page: homePage.page,
      testInfo,
      goto: () => homePage.goto(),
      openMobileMenu: () => homePage.header.openMobileMenu(),
    });
  });
});
```

`AxeBuilder` に `withTags()`、`exclude()`、`disableRules()`、`options()` は設定しない。これによりaxe-coreの既定ルールすべてを実行し、完全な `AxeResults` をテーマごとに添付する。

- [ ] **Step 3: ホームページ検査の実行行列と添付を確認する**

Run:

```bash
pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts
find test-results -type f -name 'axe-results-*.json' | sort
```

Expected: `chromium` と `Mobile Chrome` の2テストがpassし、他4 projectはskipする。`test-results/` 配下にライト／ダーク × 2 project、計4個の `axe-results-*.json` が表示される。重大違反がある場合は、両テーマの添付完了後にテーマ・ルールID・impact・targetだけを含む差分でfailするため、その違反を修正して再実行する。

- [ ] **Step 4: ホームページ検査をコミットする**

```bash
git add tests/e2e/specs/accessibility.spec.ts
git commit -m "test: ホームのアクセシビリティ検査を追加"
```

### Task 3: Aboutと代表記事を同じ検査行列へ追加する

**Files:**
- Modify: `tests/e2e/specs/accessibility.spec.ts`

- [ ] **Step 1: 現在の対象がホームだけであることを確認する**

Run:

```bash
pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts --list
```

Expected: 全6 projectについて「ホーム」だけが列挙され、合計6テスト。Aboutと代表記事はまだ列挙されない。

- [ ] **Step 2: Aboutページの検査を追加する**

`test.describe('axe-coreアクセシビリティ検査', ...)` 内のホームテスト直後へ次を追加する。

```ts
  test('About', async ({ aboutPage }, testInfo) => {
    skipUnsupportedProject(testInfo);

    await scanPageForAccessibility({
      page: aboutPage.page,
      testInfo,
      goto: () => aboutPage.goto(),
      openMobileMenu: () => aboutPage.header.openMobileMenu(),
    });
  });
```

- [ ] **Step 3: 代表記事の検査を追加する**

同じ `test.describe` 内のAboutテスト直後へ次を追加する。

```ts
  test('代表記事', async ({ articlePage }, testInfo) => {
    skipUnsupportedProject(testInfo);

    await scanPageForAccessibility({
      page: articlePage.page,
      testInfo,
      goto: () => articlePage.goto(),
      openMobileMenu: () => articlePage.header.openMobileMenu(),
    });
  });
```

- [ ] **Step 4: 3ページ×2project×2テーマの検査を実行する**

Run:

```bash
pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts
find test-results -type f -name 'axe-results-*.json' | wc -l
```

Expected: `chromium` と `Mobile Chrome` で3テストずつ、計6テストがpassし、他4 projectの計12テストは明示的にskipする。各passテストがライト／ダークを1回ずつ解析し、添付JSONの件数は `12`。`minor` / `moderate`、`incomplete`、`passes`、`inapplicable` はJSONに残るが失敗条件にはならない。

- [ ] **Step 5: 3ページのアクセシビリティ検査をコミットする**

```bash
git add tests/e2e/specs/accessibility.spec.ts
git commit -m "test: 主要ページをaxe-coreで検査"
```

### Task 4: E2Eドキュメントへ検査範囲と限界を記録する

**Files:**
- Modify: `docs/e2e-testing.md:1-62`
- Modify: `docs/e2e-testing.md`（`spec の内容` セクション）
- Modify: `docs/e2e-testing.md`（末尾の `今後の拡張候補` セクション）

- [ ] **Step 1: 概要とディレクトリ構成へアクセシビリティ検査を追加する**

冒頭の概要にある検証内容の列挙へ「axe-coreアクセシビリティ検査」を追加する。

`specs/` の一覧では `smoke.spec.ts` の直後へ次の行を追加する。

```text
    ├── accessibility.spec.ts # axe-coreアクセシビリティ検査
```

- [ ] **Step 2: axe-coreアクセシビリティ検査の仕様を追記する**

`spec の内容` のスモークテスト説明の直後へ、次のセクションを追加する。

```markdown
### axe-coreアクセシビリティ検査 (`accessibility.spec.ts`)

axe-coreが機械的に判定できる問題の再混入を検出するため、次の行列を検査します。

| ページ | ルート | デスクトップ | モバイル | テーマ |
| --- | --- | --- | --- | --- |
| ホーム | `/` | `chromium` | `Mobile Chrome` | light / dark |
| About | `/about` | `chromium` | `Mobile Chrome` | light / dark |
| 代表記事 | `/posts/audio-interface-under-the-desk` | `chromium` | `Mobile Chrome` | light / dark |

各ページを1テストとし、1テスト内で `page.emulateMedia()` によりライト、ダークの順に配色を指定してページを読み直します。`Mobile Chrome` では、閉じた状態で非表示になるナビゲーションも検査対象に含めるため、ページ読込後にハンバーガーメニューを開きます。対象外のFirefox、WebKit、Mobile Safari、Mobile Safari (Small screen)では専用specを明示的にskipします。合計のaxeスキャン数は3ページ × 2 project × 2テーマの12回です。

`AxeBuilder` にはタグ、除外対象、無効ルールを指定せず、best-practiceを含むaxe-coreの既定ルールすべてを実行します。CIを失敗させるのは `impact` が `serious` または `critical` の違反だけです。`minor` / `moderate` は失敗条件にしません。

テーマごとの完全な結果は `axe-results-light.json` / `axe-results-dark.json` としてPlaywrightレポートへ添付します。添付には `violations` だけでなく `incomplete`、`passes`、`inapplicable` も含まれるため、HTMLレポートまたはCI artifactから自動判定できなかった項目や重大度の低い違反も確認できます。標準出力とActions annotationの失敗内容は、テーマ、ルールID、impact、違反ノードのtargetだけに絞ります。

axe-coreの自動検査だけではアクセシビリティ適合を保証できません。キーボード操作、スクリーンリーダー、認知的な分かりやすさなどは検査対象外であり、`incomplete` と合わせて手動確認が必要です。
```

- [ ] **Step 3: 導入済み項目を「今後の拡張候補」から削除する**

末尾の次の見出しと箇条書きを削除する。

```markdown
## 今後の拡張候補

- axe-core などでアクセシビリティチェックを追加する。
```

直後の既存説明は、アクセシビリティspecだけ実行projectが異なることが分かる次の文へ置き換える。

```markdown
なお、スモーク・ナビゲーション・テーマ切り替え・目次 (TOC)・404 ページ・ビジュアルリグレッションは、デスクトップ（Chromium / Firefox / WebKit）とモバイル（Mobile Chrome / Mobile Safari / Mobile Safari (Small screen)）の全プロジェクトで実行します。axe-coreアクセシビリティ検査は `chromium` と `Mobile Chrome` のみで実行します。
```

- [ ] **Step 4: ドキュメントと実装の用語を照合する**

Run:

```bash
rg -n "accessibility\.spec\.ts|chromium|Mobile Chrome|serious|critical|axe-results-light\.json|自動検査だけでは" docs/e2e-testing.md
rg -n "withTags|exclude\(|disableRules|options\(" tests/e2e/specs/accessibility.spec.ts
```

Expected: 1つ目のコマンドは追加した検査範囲、失敗条件、添付名、限界の記述を表示する。2つ目のコマンドは exit code `1` で何も表示せず、axe-coreの既定ルールを狭める設定がない。

- [ ] **Step 5: ドキュメント更新をコミットする**

```bash
git add docs/e2e-testing.md
git commit -m "docs: axe-coreアクセシビリティ検査を記録"
```

### Task 5: lintと全E2Eで完了条件を検証する

**Files:**
- Verify: `package.json`
- Verify: `pnpm-lock.yaml`
- Verify: `tests/e2e/specs/accessibility.spec.ts`
- Verify: `docs/e2e-testing.md`

- [ ] **Step 1: Prettierの差分がないことを確認する**

Run:

```bash
pnpm exec prettier --check package.json tests/e2e/specs/accessibility.spec.ts docs/e2e-testing.md
```

Expected: exit code `0`、`All matched files use Prettier code style!`。失敗した場合は次を実行してから再確認する。

```bash
pnpm exec prettier --write package.json tests/e2e/specs/accessibility.spec.ts docs/e2e-testing.md
```

- [ ] **Step 2: lintと型チェックを実行する**

Run:

```bash
pnpm run lint
```

Expected: exit code `0`。ESLint、Astro check、`tsc --noEmit` がすべて成功し、`AxeBuilder` の戻り値から導出した `impact` / `target` の型にもエラーがない。

- [ ] **Step 3: 専用specを最終確認する**

Run:

```bash
pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts
find test-results -type f -name 'axe-results-*.json' | wc -l
```

Expected: 6 passed、12 skipped。axeスキャン12回が完了し、JSON添付数は `12`。`serious` / `critical` の違反は0件。

- [ ] **Step 4: 既存テストを含む全E2Eを実行する**

Run:

```bash
pnpm run test:e2e
```

Expected: exit code `0`。既存9 specに `accessibility.spec.ts` を加えた全E2Eが成功し、Playwright HTMLレポートに各アクセシビリティテストのライト／ダークJSONが表示される。

- [ ] **Step 5: 最終差分を確認する**

Run:

```bash
git status --short
git diff --check
```

Expected: `git diff --check` が exit code `0`。未コミット差分がある場合は、今回の4ファイルだけであることを確認する。検証中の整形修正がある場合は次でコミットする。

```bash
git add package.json pnpm-lock.yaml tests/e2e/specs/accessibility.spec.ts docs/e2e-testing.md
git commit -m "test: axe-coreアクセシビリティ検査を仕上げる"
```
