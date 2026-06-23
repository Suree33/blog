import { expect, test } from '../fixtures/test';

const screenshotStylePath = new URL('../styles/screenshot.css', import.meta.url)
  .pathname;

const screenshotOptions = {
  animations: 'disabled',
  stylePath: screenshotStylePath,
} as const;

/**
 * ビジュアルリグレッションのスナップショット。
 *
 * このフェーズではスナップショット行列を小さく安定させるため、デスクトッププロジェクトに
 * 限定している。モバイルのビジュアルスナップショットは意図的に除外している。
 * フルページキャプチャよりもコンポーネント/ロケーター単位のスクリーンショットを優先し、
 * ベースラインを小さく、かつ無関係なコンテンツ変更に影響されにくくしている。
 *
 * 記事メタデータのスナップショットは最も価値が高い対象: Astro の `compressHTML` によって
 * メタデータブロック内の余白が潰されたような、空白/レイアウトのリグレッションを検出する。
 *
 * スナップショットは `tests/e2e/specs/visual.spec.ts-snapshots/` にコミットする。
 * 意図的な UI 変更後は `pnpm run test:e2e:update`（または
 * `pnpm run test:e2e -- --update-snapshots`）で再生成する。
 */
test.describe('ビジュアルリグレッション', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'デスクトップのみ');

  test.beforeEach(async ({ page }) => {
    // システム配色を固定し、テーマトグルアイコン
    // （sun-moon / moon / sun）や prefers-color-scheme スタイルが
    // 実行間で決定的になるようにする。
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('記事メタデータブロック', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(articlePage.metadata.root).toHaveScreenshot(
      'article-metadata.png',
      screenshotOptions,
    );
  });

  test('サイトヘッダー', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.header.root).toHaveScreenshot(
      'header.png',
      screenshotOptions,
    );
  });

  test('ホームのサンプル記事リスト項目', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.postList.sampleArticleLink).toHaveScreenshot(
      'home-sample-article-item.png',
      screenshotOptions,
    );
  });
});
