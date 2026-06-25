import { expect, test } from '../fixtures/test';
import { routes, sampleArticleTitle } from '../utils/routes';

/**
 * `/rss.xml` RSS フィードの E2E 検証。
 *
 * RSS はブラウザ描画ではなく XML 応答のため、ビューポートやブラウザエンジンに
 * 依存しない。重複実行を避けるため Chromium 1 プロジェクトのみで実行する。
 *
 * 期待仕様（`src/pages/rss.xml.ts` 参考）:
 * - `@astrojs/rss` が `Content-Type: application/xml` で応答する。
 * - `<channel>` に `config.siteName`・`config.description`・`<language>ja-jp</language>` が含まれる。
 * - 各 `<item>` は `title` と `pubDate` frontmatter を持つ記事のみ（`hasRequiredFrontmatter`）。
 *   `title` または `pubDate` が未設定の記事（例: 記事テンプレート）はフィードから除外される。
 *   本リポジトリに draft 扱いは存在せず、上記 frontmatter 条件のみで絞り込む。
 */
test.describe('RSS フィード', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(
      browserName !== 'chromium',
      'XML 応答ベースの検証のため Chromium 1 プロジェクトのみで実行',
    );
  });

  test.beforeEach(async ({ rssFeedPage }) => {
    await rssFeedPage.goto();
  });

  test('/rss.xml が 200 で XML の content-type を返す', async ({
    rssFeedPage,
  }) => {
    expect(rssFeedPage.response.status()).toBe(200);
    expect(rssFeedPage.response.headers()['content-type']).toMatch(/xml/i);
  });

  test('チャネルにサイト名と説明と言語が含まれる', async ({ rssFeedPage }) => {
    const feed = await rssFeedPage.content();

    expect(feed.siteName).toBe('Daiki Sato');
    expect(feed.description).toBe('Daiki Satoのブログ');
    expect(feed.language).toBe('ja-jp');
  });

  test('代表記事のタイトルとリンクが含まれる', async ({ rssFeedPage }) => {
    const feed = await rssFeedPage.content();

    const sample = feed.items.find((item) => item.title === sampleArticleTitle);
    expect(sample).toBeTruthy();
    // ホスト・末尾スラッシュの差異に依存しないようパスで部分一致させる。
    expect(sample?.link).toContain(routes.sampleArticle);
  });

  test('frontmatter 不足の記事はフィードから除外される', async ({
    rssFeedPage,
  }) => {
    const { items } = await rssFeedPage.content();

    expect(items.length).toBeGreaterThan(0);
    // hasRequiredFrontmatter (title + pubDate) を通過した記事だけが並ぶため、
    // 全 item が title・link を持つ。
    for (const item of items) {
      expect(item.title).not.toBe('');
      expect(item.link).not.toBe('');
    }
    // 記事テンプレート (title 未設定) はフィードに出現しない。
    expect(items.some((item) => item.link.includes('/template/'))).toBe(false);
  });
});
