import { expect, test } from '../fixtures/test';
import { HOME_URL_REGEX } from '../utils/regex';

/**
 * 404 ページの E2E。
 *
 * 存在しない URL にアクセスしたとき 404 ページが表示され、主要な見出しが
 * 期待どおりであること、ホームへ戻る導線が機能することを検証する。
 * デスクトップ・モバイル両方のプロジェクトで実行する。
 */
test.describe('404 ページ', () => {
  test('存在しない URL で 404 ページが表示される', async ({ notFoundPage }) => {
    const response = await notFoundPage.goto();

    // 404 ステータスであることを検証する。
    expect(response?.status()).toBe(404);

    // ページタイトルと主要な見出しが期待どおりであることを確認する。
    await expect(notFoundPage.page).toHaveTitle(/404.*Daiki Sato/);
    await expect(notFoundPage.heading).toBeVisible();
  });

  test('ホームに戻るリンクでホームに遷移する', async ({ notFoundPage }) => {
    await notFoundPage.goto();

    // 導線が存在することを確認してからクリックで遷移を検証する。
    await expect(notFoundPage.homeLink).toBeVisible();
    await notFoundPage.homeLink.click();

    await expect(notFoundPage.page).toHaveURL(HOME_URL_REGEX);
  });
});