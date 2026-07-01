import { expect, test } from '../fixtures/test';
import { escapeRegExp } from '../utils/regex';
import { sampleArticleTitle } from '../utils/routes';

test.describe('スモークテスト', () => {
  test('ホームページにブログタイトルと記事一覧が表示される', async ({
    homePage,
  }) => {
    await homePage.goto();

    await expect(
      homePage.page,
      'ホームページのタイトルに Blog とサイト名が含まれる',
    ).toHaveTitle(/Blog.*Daiki Sato/);

    await expect(
      homePage.postList.sampleArticleLink,
      'ホームページの記事一覧にサンプル記事リンクが表示される',
    ).toBeVisible();
  });

  test('About ページが読み込まれる', async ({ aboutPage }) => {
    await aboutPage.goto();

    await expect(
      aboutPage.page,
      'About ページのタイトルに About とサイト名が含まれる',
    ).toHaveTitle(/About.*Daiki Sato/);
    await expect(
      aboutPage.heading,
      'About ページに Daiki Sato の見出しが表示される',
    ).toBeVisible();
  });

  test('サンプル記事が読み込まれる', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(
      articlePage.page,
      `サンプル記事のタイトルに「${sampleArticleTitle}」とサイト名が含まれる`,
    ).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
    await expect(
      articlePage.heading,
      `サンプル記事に「${sampleArticleTitle}」の見出しが表示される`,
    ).toBeVisible();
  });
});
