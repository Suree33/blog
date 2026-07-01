import { expect, test } from '../fixtures/test';
import {
  routes,
  sampleArticleDescription,
  sampleArticleTitle,
} from '../utils/routes';

/**
 * `/posts/[slug].md` raw Markdown エンドポイントの E2E テスト。
 *
 * Astro の静的ビルドで `/posts/[slug].md` が生成され、`astro preview` から配信される。
 * 実装は `src/pages/posts/[slug].md.ts`、仕様は `docs/raw-markdown-endpoints.md` 参照。
 *
 * `Content-Type` は本番（Cloudflare Workers Static Assets）では
 * `text/markdown; charset=utf-8` になるが、E2E で使う `astro preview` は
 * `text/markdown` のみを返す。そのため charset 部分は厳密に検証せず、
 * `text/markdown` であることだけを確認する（charset の厳密検証は Workers
 * プレビューが必要なため別途切り出す）。
 *
 * 通常記事 URL + `Accept: text/markdown` による content negotiation は
 * `src/worker.ts` で実装されており、Workers プレビュー側でのみ機能する。
 * `astro preview` では Worker を経由しないため本 spec の対象外とし、別 Issue で扱う。
 */
test.describe('raw Markdown エンドポイント', () => {
  test('代表記事の .md URL が raw Markdown を返す', async ({ request }) => {
    const response = await request.get(routes.sampleArticleMarkdown);

    // 200 OK
    expect(
      response.status(),
      '代表記事の raw Markdown URL は HTTP 200 を返す',
    ).toBe(200);

    // Content-Type が Markdown であること
    expect(
      response.headers()['content-type'] ?? '',
      '代表記事の raw Markdown 応答は text/markdown を返す',
    ).toMatch(/^text\/markdown\b/);

    const body = await response.text();

    // frontmatter を含むこと
    expect(
      body.startsWith('---\n'),
      'raw Markdown は frontmatter で始まる',
    ).toBe(true);
    expect(
      body,
      `raw Markdown の frontmatter に記事タイトル「${sampleArticleTitle}」が含まれる`,
    ).toContain(`title: ${sampleArticleTitle}`);
    expect(
      body,
      'raw Markdown の frontmatter に代表記事の description が含まれる',
    ).toContain(`description: ${sampleArticleDescription}`);

    // 本文を含むこと（frontmatter 終端の後に本体がある）
    const closingFrontmatterIndex = body.indexOf('\n---', 4);
    expect(
      closingFrontmatterIndex,
      'raw Markdown に frontmatter の終端が含まれる',
    ).toBeGreaterThan(-1);
    const articleBody = body.slice(closingFrontmatterIndex + '\n---'.length);
    expect(
      articleBody.trim().length,
      'frontmatter の後に記事本文が含まれる',
    ).toBeGreaterThan(0);

    // Astro 表示用の `layout` frontmatter は除去されていること
    expect(
      body,
      'raw Markdown の frontmatter から Astro 表示用の layout が除去される',
    ).not.toMatch(/^layout:/m);
  });
});
