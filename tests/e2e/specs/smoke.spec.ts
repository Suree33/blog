import { expect, test } from '../fixtures/test';
import { escapeRegExp } from '../utils/regex';
import { sampleArticleTitle } from '../utils/routes';

test.describe('スモークテスト', () => {
  test('ホームページにブログタイトルと記事一覧が表示される', async ({
    homePage,
  }) => {
    await homePage.goto();

    await expect(homePage.page).toHaveTitle(/Blog.*Daiki Sato/);

    await expect(homePage.postList.sampleArticleLink).toBeVisible();
  });

  test('About ページが読み込まれる', async ({ aboutPage }) => {
    await aboutPage.goto();

    await expect(aboutPage.page).toHaveTitle(/About.*Daiki Sato/);
    await expect(aboutPage.heading).toBeVisible();
  });

  test('サンプル記事が読み込まれる', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(articlePage.page).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
    await expect(articlePage.heading).toBeVisible();
  });
});
