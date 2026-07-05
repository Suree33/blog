import { expect, test } from '../fixtures/test';
import { allPosts } from '../utils/routes';

test.describe('全記事の基本表示', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name !== 'chromium',
      '全記事のレイアウト回帰は Chromium で1回ずつ検証する',
    );
  });

  for (const post of allPosts) {
    test(`${post.title} が記事レイアウトで表示される`, async ({ page }) => {
      const response = await page.goto(post.route);

      expect(response, `${post.route} のレスポンスが取得できる`).not.toBeNull();
      expect(response?.status(), `${post.route} は HTTP 200 を返す`).toBe(200);
      await expect(
        page.getByRole('article'),
        `${post.route} に記事レイアウトの article が表示される`,
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 1, name: post.title }),
        `${post.route} に記事タイトルの h1 が表示される`,
      ).toBeVisible();

      if ('highlightedCode' in post) {
        for (const [language, count] of Object.entries(post.highlightedCode)) {
          await expect(
            page.locator(`pre.astro-code[data-language="${language}"]`),
            `${post.route} の ${language} コードが Shiki でハイライトされる`,
          ).toHaveCount(count);
        }
      }

      if ('imageAlt' in post) {
        const image = page.getByRole('img', { name: post.imageAlt }).first();
        await expect(
          image,
          `${post.route} の記事画像が表示される`,
        ).toBeVisible();
        await expect
          .poll(
            () =>
              image.evaluate(
                (element: HTMLImageElement) =>
                  element.complete && element.naturalWidth > 0,
              ),
            { message: `${post.route} の記事画像が読み込まれる` },
          )
          .toBe(true);
      }
    });
  }
});
