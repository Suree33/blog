import { expect, test } from '../fixtures/test';
import { escapeRegExp } from '../utils/regex';
import { routes, sampleArticleTitle } from '../utils/routes';

test.describe('smoke', () => {
  test('home page renders the blog title and article list', async ({
    page,
  }) => {
    await page.goto(routes.home);

    await expect(page).toHaveTitle(/Blog.*Daiki Sato/);

    const sampleArticleLink = page.getByRole('link', {
      name: sampleArticleTitle,
    });
    await expect(sampleArticleLink).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto(routes.about);

    await expect(page).toHaveTitle(/About.*Daiki Sato/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Daiki Sato' }),
    ).toBeVisible();
  });

  test('sample article loads', async ({ page }) => {
    await page.goto(routes.sampleArticle);

    await expect(page).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
    await expect(
      page.getByRole('heading', { level: 1, name: sampleArticleTitle }),
    ).toBeVisible();
  });
});
