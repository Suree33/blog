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

    await expect(
      page,
      `タグ「${sampleTag}」のページが /tags/ 配下に表示される`,
    ).toHaveURL(/\/tags\//);
    await expect(
      tagPage.page,
      `タグページのタイトルに「${sampleTag}」とサイト名が含まれる`,
    ).toHaveTitle(new RegExp(`${escapeRegExp(sampleTag)}.*Daiki Sato`));
  });

  test('見出しに対象タグ名が表示される', async ({ tagPage }) => {
    await tagPage.goto(sampleTag);

    await expect(
      tagPage.heading,
      `タグ「${sampleTag}」のページに主要見出しが表示される`,
    ).toBeVisible();
    await expect(
      tagPage.heading,
      `タグページの主要見出しに「${sampleTag}」が含まれる`,
    ).toContainText(sampleTag);
  });

  test('対象タグの記事リンクが表示される', async ({ tagPage }) => {
    await tagPage.goto(sampleTag);

    await expect(
      tagPage.postList.sampleArticleLink,
      `タグ「${sampleTag}」の記事一覧にサンプル記事リンクが表示される`,
    ).toBeVisible();
  });

  test('タグページのリストから記事に遷移できる', async ({ tagPage, page }) => {
    await tagPage.goto(sampleTag);
    await tagPage.postList.sampleArticleLink.click();

    await expect(
      page,
      'タグページのサンプル記事リンクから代表記事 URL に遷移する',
    ).toHaveURL(/\/posts\/audio-interface-under-the-desk\/?$/);
    await expect(
      tagPage.page,
      `タグページから遷移した記事のタイトルに「${sampleArticleTitle}」とサイト名が含まれる`,
    ).toHaveTitle(
      new RegExp(`${escapeRegExp(sampleArticleTitle)}.*Daiki Sato`),
    );
  });
});
