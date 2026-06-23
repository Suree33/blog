import { expect, test } from '../fixtures/test';
import { escapeRegExp } from '../utils/regex';
import { sampleArticleTitle } from '../utils/routes';

test.describe('smoke', () => {
  test('home page renders the blog title and article list', async ({
    homePage,
  }) => {
    await homePage.goto();

    await expect(homePage.page).toHaveTitle(/Blog.*Daiki Sato/);

    await expect(homePage.postList.sampleArticleLink).toBeVisible();
  });

  test('about page loads', async ({ aboutPage }) => {
    await aboutPage.goto();

    await expect(aboutPage.page).toHaveTitle(/About.*Daiki Sato/);
    await expect(aboutPage.heading).toBeVisible();
  });

  test('sample article loads', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(articlePage.page).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
    await expect(articlePage.heading).toBeVisible();
  });
});
