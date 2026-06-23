import { type Locator, type Page } from '@playwright/test';
import { sampleArticleTitle } from '../utils/routes';

/**
 * ホームページの記事一覧を薄くラップしたコンポーネント。
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
   * `.first()` は、将来のページで `<main>` 内に追加の `<ul>` が追加された場合でも
   * 先頭のリストにロケーターを固定し、ビジュアルスナップショットを決定的に保つ。
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
