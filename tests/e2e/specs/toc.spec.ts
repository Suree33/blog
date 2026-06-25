import { expect, test } from '../fixtures/test';

/**
 * 記事ページの目次（TOC）。
 *
 * サンプル記事（`/posts/audio-interface-under-the-desk`）は h2 を 2 つ持つため、
 * TOC には 2 つのリンクが表示される。この記事を代表例として TOC の表示、
 * リンククリックによる見出しへの移動、`aria-current="location"` の追従、
 * デスクトップ/モバイルの表示仕様の差異を検証する。
 *
 * デスクトップ・モバイル両方のプロジェクトで実行する。
 */
test.describe('目次 (TOC)', () => {
  test('見出しを持つ記事で目次ナビゲーションが表示される', async ({
    articlePage,
  }) => {
    await articlePage.goto();

    await expect(articlePage.toc.root).toBeVisible();
    // サンプル記事の TOC 項目数は h2 x 2 と一致する。
    await expect(articlePage.toc.links).toHaveCount(2);
  });

  test('初期状態では最初の見出しが current になる', async ({ articlePage }) => {
    await articlePage.goto();

    await expect(articlePage.toc.links.first()).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(articlePage.toc.links.last()).not.toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('TOC リンクをクリックすると該当見出しへ移動し current が更新される', async ({
    articlePage,
    page,
  }) => {
    await articlePage.goto();

    const linkName = '今回やったこと';
    const link = articlePage.toc.link(linkName);
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#.+/);

    await link.click();

    // ハッシュが URL に反映される（非 ASCII はパーセントエンコードされるので復号して比較）。
    await expect
      .poll(async () => decodeURIComponent(new URL(page.url()).hash))
      .toBe(href);

    // 対象見出しがビューポート内にスクロールされる。
    const id = await link.getAttribute('data-toc-id');
    const heading = page.locator(`[id="${id}"]`);
    await expect(heading).toBeInViewport();

    // クリック（ハッシュ変更）後に対応リンクが current になる。
    await expect(link).toHaveAttribute('aria-current', 'location');
  });

  test('スクロール位置に応じて current が更新される', async ({
    articlePage,
    page,
  }) => {
    await articlePage.goto();

    // 末尾までスクロールすると最後の見出しが current になる。
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    await expect(articlePage.toc.links.last()).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('デスクトップとモバイルで表示される TOC は1つだけ', async ({
    articlePage,
    page,
  }) => {
    await articlePage.goto();

    // デスクトップ用（sticky サイドバー）とモバイル用（本文内インライン）の 2 つの TOC が
    // DOM 上に存在し、ビューポート幅に応じて一方だけが可視になる。
    // `getByRole('navigation')` は `display:none` の nav をアクセシビリティツリーから
    // 除くため見落とすので、`data-toc-root` 属性で DOM 上の全件を数える。
    const allRoots = page.locator('[data-toc-root]');
    await expect(allRoots).toHaveCount(2);
    await expect(allRoots.filter({ visible: true })).toHaveCount(1);
  });
});
