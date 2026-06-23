import { expect, test } from '../fixtures/test';

/** HTML の `class` 属性値内で `dark` を単独のクラスとしてマッチする。 */
const DARK = /(?:^|\s)dark(?:\s|$)/;
/** HTML の `class` 属性値内で `light` を単独のクラスとしてマッチする。 */
const LIGHT = /(?:^|\s)light(?:\s|$)/;

/**
 * テーマトグルの挙動。
 *
 * テーマトグルボタンはヘッダーのアイコン群にあり、小さいビューポートでは
 * モバイルのスライドダウンメニュー内に隠れるため、デスクトッププロジェクトに限定する。
 * システム配色を `light` にエミュレートし、3 状態のトグルサイクル
 * （ダーク → ライト → システム）を決定的にする。
 */
test.describe('テーマトグル', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'デスクトップのみ');

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('ダーク → ライト → システムを循環し、リロード後も永続化する', async ({
    homePage,
    page,
  }) => {
    await homePage.goto();

    const html = page.locator('html');

    // 新規コンテキスト => テーマ未保存 => <html> には明示的なクラスなし。
    await expect(html).not.toHaveAttribute('class', DARK);
    await expect(html).not.toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBeNull();

    // 1 回目のクリック: 現在は system（null）、システムは light => dark を適用。
    await homePage.header.toggleTheme();
    await expect(html).toHaveAttribute('class', DARK);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('dark');

    // 永続化: リロードすると localStorage からテーマを復元する。
    await page.reload();
    await expect(html).toHaveAttribute('class', DARK);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('dark');

    // 2 回目のクリック: 現在は dark、システムは light => light を適用。
    await homePage.header.toggleTheme();
    await expect(html).toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('light');

    // 3 回目のクリック: 現在は light、システムは light => system に戻す。
    await homePage.header.toggleTheme();
    await expect(html).not.toHaveAttribute('class', DARK);
    await expect(html).not.toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBeNull();
  });
});
