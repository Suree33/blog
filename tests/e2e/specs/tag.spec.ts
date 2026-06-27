import { expect, test } from '../fixtures/test';
import { escapeRegExp } from '../utils/regex';
import { sampleArticleTitle, sampleTag } from '../utils/routes';

/**
 * タグページ（`/tags/[tag]`）のスモーク確認。
 *
 * 代表タグ（`ガジェット`）はサンプル記事を含む複数記事に付与されており、
 * 安定した検証対象として使う。アサーションは spec 側に置く。
 */
test.describe('タグページ', () => {
  test('代表タグページにアクセスできる', async ({ tagPage, page }) => {
    await tagPage.goto(sampleTag);

    await expect(page).toHaveURL(/\/tags\//);
    await expect(tagPage.page).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleTag)}.*Daiki Sato`),
    );
  });

  test('見出しに対象タグ名が表示される', async ({ tagPage }) => {
    await tagPage.goto(sampleTag);

    await expect(tagPage.heading).toBeVisible();
    await expect(tagPage.heading).toContainText(sampleTag);
  });

  test('対象タグの記事リンクが表示される', async ({ tagPage }) => {
    await tagPage.goto(sampleTag);

    await expect(tagPage.postList.sampleArticleLink).toBeVisible();
  });

  test('タグページのリストから記事に遷移できる', async ({ tagPage, page }) => {
    await tagPage.goto(sampleTag);
    await tagPage.postList.sampleArticleLink.click();

    await expect(page).toHaveURL(/\/posts\/audio-interface-under-the-desk\/?$/);
    await expect(tagPage.page).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
  });
});
