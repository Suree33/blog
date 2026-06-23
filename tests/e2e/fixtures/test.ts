import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { AboutPage } from '../pages/about-page';
import { ArticlePage } from '../pages/article-page';

/**
 * ブログ E2E スイートで共有する Playwright テスト fixture。
 *
 * `base` をページオブジェクトモデルの fixture で拡張し、spec 側が
 * `homePage` / `aboutPage` / `articlePage` を自前で構築しなくても依存できるようにする。
 * `isDesktop` は、各 spec でビューポート数値をハードコードすることなく、
 * デスクトッププロジェクトに限定した挙動を記述できるようにする。
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
