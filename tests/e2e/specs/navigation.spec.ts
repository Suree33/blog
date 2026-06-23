import { expect, test } from '../fixtures/test';
import { HOME_URL_REGEX } from '../utils/regex';

/**
 * Header and footer navigation links.
 *
 * Scoped to the desktop project because the header nav links are hidden inside
 * the mobile slide-down menu on small viewports and would require opening the
 * hamburger menu first. Footer links are always visible, but the whole suite is
 * kept on desktop for simplicity in this phase.
 */
test.describe('navigation', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'desktop only');

  test('header Blog link navigates to home', async ({ aboutPage, page }) => {
    await aboutPage.goto();
    await aboutPage.header.blogLink.click();

    await expect(page).toHaveURL(HOME_URL_REGEX);
  });

  test('header About link navigates to about', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.header.aboutLink.click();

    await expect(page).toHaveURL(/\/about\/?$/);
  });

  test('footer Blog link navigates to home', async ({ aboutPage, page }) => {
    await aboutPage.goto();
    await expect(aboutPage.footer.rssLink).toBeVisible();
    await aboutPage.footer.blogLink.click();

    await expect(page).toHaveURL(HOME_URL_REGEX);
  });

  test('footer About link navigates to about', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.footer.aboutLink.click();

    await expect(page).toHaveURL(/\/about\/?$/);
  });
});
