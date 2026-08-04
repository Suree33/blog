import { expect, test } from '../fixtures/test';
import { routes } from '../utils/routes';

const mobileArticleRoutes = [
  routes.articleWithoutCodeBlock,
  routes.articleWithCodeBlock,
] as const;

/**
 * 記事本文のレスポンシブレイアウト。
 *
 * コードブロックの有無で flex item の最小幅が変わっても、モバイルでは同じ本文幅に
 * なることを検証する。デスクトップでは本文とサイドバー目次のガターを維持する。
 */
test.describe('記事本文のレスポンシブレイアウト', () => {
  test('モバイルではコードブロックの有無によらず本文が利用可能な幅を使う', async ({
    articlePage,
    page,
  }) => {
    const viewportWidth = page.viewportSize()?.width;
    if (viewportWidth === undefined || viewportWidth >= 1280) {
      test.skip(true, 'モバイルレイアウト専用の検証');
      return;
    }

    for (const route of mobileArticleRoutes) {
      await page.goto(route);

      const articleBox = await articlePage.root.boundingBox();
      expect(articleBox, `${route} の記事本文が表示される`).not.toBeNull();
      expect(
        articleBox?.x,
        `${route} の記事本文は画面左端から 16px の余白を持つ`,
      ).toBe(16);
      expect(
        articleBox?.width,
        `${route} の記事本文は左右 16px を除いた幅を使う`,
      ).toBe(viewportWidth - 32);

      const documentWidth = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        documentWidth.scrollWidth,
        `${route} でページ全体の横スクロールが発生しない`,
      ).toBe(documentWidth.clientWidth);
    }
  });

  test('デスクトップでは本文とサイドバー目次の間にガターを保つ', async ({
    articlePage,
    page,
  }) => {
    const viewportWidth = page.viewportSize()?.width;
    if (viewportWidth === undefined || viewportWidth < 1280) {
      test.skip(true, 'デスクトップレイアウト専用の検証');
      return;
    }

    await articlePage.goto();

    const articleBox = await articlePage.root.boundingBox();
    const tocBox = await articlePage.toc.root.boundingBox();
    expect(articleBox, 'デスクトップで記事本文が表示される').not.toBeNull();
    expect(tocBox, 'デスクトップでサイドバー目次が表示される').not.toBeNull();
    expect(
      (tocBox?.x ?? 0) - ((articleBox?.x ?? 0) + (articleBox?.width ?? 0)),
      '記事本文とサイドバー目次の間に 32px のガターを保つ',
    ).toBe(32);
  });
});
