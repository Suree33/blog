import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { AboutPage } from '../pages/about-page';
import { ArticlePage } from '../pages/article-page';

/**
 * Shared Playwright test fixture for the blog E2E suite.
 *
 * Extends `base` with Page Object Model fixtures so specs can depend on
 * `homePage`, `aboutPage` and `articlePage` instead of constructing them.
 * `isDesktop` lets specs scope behaviour to the desktop project without
 * hard-coding viewport numbers in each spec.
 */
export const test = base.extend<{
  homePage: HomePage;
  aboutPage: AboutPage;
  articlePage: ArticlePage;
  isDesktop: boolean;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  isDesktop: async ({ page }, use) => {
    await use((page.viewportSize()?.width ?? 1280) >= 768);
  },
});

export { expect };
