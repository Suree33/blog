import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { AboutPage } from '../pages/about-page';
import { ArticlePage } from '../pages/article-page';
import { TagPage } from '../pages/tag-page';

/**
 * ブログ E2E スイートで共有する Playwright fixture。
 *
 * spec 側で `homePage` / `aboutPage` / `articlePage` / `tagPage` を毎回生成しなくて
 * 済むようにする。`isDesktop` は、viewport の数値を各 spec に直接書かずにデスクトップ
 * 限定のテストを表現するために使う。
 */
export const test = base.extend<{
  homePage: HomePage;
  aboutPage: AboutPage;
  articlePage: ArticlePage;
  tagPage: TagPage;
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
  tagPage: async ({ page }, use) => {
    await use(new TagPage(page));
  },
  isDesktop: async ({ page }, use) => {
    await use((page.viewportSize()?.width ?? 1280) >= 768);
  },
});

export { expect };
