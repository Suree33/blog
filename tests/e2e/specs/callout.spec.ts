import { expect, test } from '../fixtures/test';
import { routes } from '../utils/routes';

const articleTitle =
  'sidekick.nvimでCodexを使うと表示される [features].web_search_request is deprecated を解消する';

test.describe('Callout', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name !== 'chromium',
      'Callout の統合確認は Chromium で1回だけ実行する',
    );
  });

  test('記事内の Callout が種類とGitHub風の基本スタイルを保って表示される', async ({
    articlePage,
  }) => {
    await articlePage.goto(routes.calloutArticle, articleTitle);

    const info = articlePage.callout('info');
    const note = articlePage.callout('note');

    await expect(info).toHaveCount(1);
    await expect(note).toHaveCount(2);
    await expect(info).toHaveAttribute('aria-label', 'Info');
    await expect(note.first()).toHaveAttribute('aria-label', 'Note');
    await expect(info).toHaveCSS('border-left-style', 'solid');
    await expect(info).toHaveCSS('border-left-width', '4px');
    await expect(info.locator('.callout-title')).toHaveCSS(
      'color',
      'rgb(9, 105, 218)',
    );

    await articlePage.page.emulateMedia({ colorScheme: 'dark' });
    await articlePage.page.reload();
    await expect(
      articlePage.callout('info').locator('.callout-title'),
    ).toHaveCSS('color', 'rgb(47, 129, 247)');
  });
});
