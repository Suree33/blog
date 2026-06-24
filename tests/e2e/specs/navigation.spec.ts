import { expect, test } from '../fixtures/test';
import { HOME_URL_REGEX } from '../utils/regex';

/**
 * ヘッダーとフッターのナビゲーションリンク。
 *
 * ヘッダーのナビリンクは小さいビューポートではモバイルメニュー内に隠れるため、
 * デスクトッププロジェクトに限定する。
 * フッターのリンクは常に表示されるが、条件を揃えるため同じくデスクトップで確認する。
 */
test.describe('ナビゲーション', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'デスクトップのみ');

  test('ヘッダーの Blog リンクでホームに遷移する', async ({
    aboutPage,
    page,
  }) => {
    await aboutPage.goto();
    await aboutPage.header.blogLink.click();

    await expect(page).toHaveURL(HOME_URL_REGEX);
  });

  test('ヘッダーの About リンクで About に遷移する', async ({
    homePage,
    page,
  }) => {
    await homePage.goto();
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
