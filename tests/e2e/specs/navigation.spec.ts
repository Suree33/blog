import { expect, test } from '../fixtures/test';
import { HOME_URL_REGEX } from '../utils/regex';

/**
 * ヘッダーとフッターのナビゲーションリンク。
 *
 * ヘッダーのナビリンクは小さいビューポートではモバイルメニュー内に隠れるため、
 * モバイルではハンバーガーメニューを開いてから操作する。
 * フッターのリンクはどのビューポートでも常に表示される。
 * デスクトップ・モバイル両方のプロジェクトで実行する。
 */
test.describe('ナビゲーション', () => {
  test('ヘッダーの Blog リンクでホームに遷移する', async ({
    aboutPage,
    isDesktop,
    page,
  }) => {
    await aboutPage.goto();
    if (!isDesktop) {
      await aboutPage.header.openMobileMenu();
    }
    await aboutPage.header.blogLink.click();

    await expect(page).toHaveURL(HOME_URL_REGEX);
  });

  test('ヘッダーの About リンクで About に遷移する', async ({
    homePage,
    isDesktop,
    page,
  }) => {
    await homePage.goto();
    if (!isDesktop) {
      await homePage.header.openMobileMenu();
    }
    await homePage.header.aboutLink.click();

    await expect(page).toHaveURL(/\/about\/?$/);
  });

  test('フッターの Blog リンクでホームに遷移する', async ({
    aboutPage,
    page,
  }) => {
    await aboutPage.goto();
    await expect(aboutPage.footer.rssLink).toBeVisible();
    await aboutPage.footer.blogLink.click();

    await expect(page).toHaveURL(HOME_URL_REGEX);
  });

  test('フッターの About リンクで About に遷移する', async ({
    homePage,
    page,
  }) => {
    await homePage.goto();
    await homePage.footer.aboutLink.click();

    await expect(page).toHaveURL(/\/about\/?$/);
  });
});
