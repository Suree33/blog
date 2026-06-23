import { expect, test } from '../fixtures/test';

const screenshotStylePath = new URL('../styles/screenshot.css', import.meta.url)
  .pathname;

const screenshotOptions = {
  animations: 'disabled',
  stylePath: screenshotStylePath,
} as const;

/**
 * Visual regression snapshots.
 *
 * Scoped to the desktop project to keep the snapshot matrix small and stable
 * in this phase; mobile visual snapshots are intentionally omitted. Component /
 * locator-level screenshots are preferred over full-page captures so the
 * baselines stay small and less sensitive to unrelated content changes.
 *
 * The article metadata snapshot is the highest-value target: it catches
 * whitespace / layout regressions such as the Astro `compressHTML` issue that
 * collapsed spacing inside the metadata block.
 *
 * Snapshots are committed under `tests/e2e/specs/visual.spec.ts-snapshots/`.
 * Regenerate them with `pnpm run test:e2e:update` (or
 * `pnpm run test:e2e -- --update-snapshots`) after intentional UI changes.
 */
test.describe('visual regression', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'desktop only');

  test.beforeEach(async ({ page }) => {
    // Fix the system colour scheme so the theme-toggle icon
    // (sun-moon / moon / sun) and any prefers-color-scheme styles are
    // deterministic across runs.
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('article metadata block', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(articlePage.metadata.root).toHaveScreenshot(
      'article-metadata.png',
      screenshotOptions,
    );
  });

  test('site header', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.header.root).toHaveScreenshot(
      'header.png',
      screenshotOptions,
    );
  });

  test('home sample article list item', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.postList.sampleArticleLink).toHaveScreenshot(
      'home-sample-article-item.png',
      screenshotOptions,
    );
  });
});
