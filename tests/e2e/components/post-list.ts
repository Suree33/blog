import { type Locator, type Page } from '@playwright/test';
import { sampleArticleTitle } from '../utils/routes';

/**
 * ホームページの記事一覧に対するロケーターをまとめる。
 *
 * リストは `<main>` ランドマーク内の `<ul>`。Tailwind の preflight が
 * `list-style: none` を設定するため、Chrome は `<ul>` の暗黙的な `list` role を
 * 落とす。そのため、root は `getByRole('list')` ではなく
 * `main` ランドマーク + `ul` セレクターで特定する。
 */
export class PostList {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 記事リストのコンテナ（`<main>` 内の `<ul>`）。
   *
   * 将来 `<main>` 内に別の `<ul>` が増えても対象がぶれないよう、先頭のリストに固定する。
   */
  get root(): Locator {
    return this.page.getByRole('main').locator('ul').first();
  }

  /**
   * リスト内の記事リンクを、タイトルテキストで特定する。
   *
   * 汎用ヘルパーなので、サンプル記事に限らず任意の記事を対象にできる。
   */
  articleLink(title: string): Locator {
    return this.root.getByRole('link', { name: title });
  }

  /** サンプル記事リンクへの簡易アクセサー。 */
  get sampleArticleLink(): Locator {
    return this.articleLink(sampleArticleTitle);
  }
}
