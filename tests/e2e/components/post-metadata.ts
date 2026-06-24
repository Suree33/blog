import { type Locator, type Page } from '@playwright/test';

/**
 * 記事メタデータブロック（タグ + 日付）のロケーターをまとめる。
 *
 * メタデータのコンテナはセマンティック role や `aria-label` を持たない `<div>` なので、
 * 安定した `dot-separated` クラスで特定し、さらに `<time>` 要素を含むインスタンスに
 * 絞り込み、ビジュアルリグレッションでも安定して同じ要素を取得できるようにする。
 */
export class PostMetadata {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** メタデータコンテナ（タグと日付を含む `<div class="dot-separated">`）。 */
  get root(): Locator {
    return this.page
      .locator('.dot-separated')
      .filter({ has: this.page.locator('time') });
  }

  /** 公開日の `<time>` 要素。 */
  get pubDate(): Locator {
    return this.root.locator('time').first();
  }

  /** メタデータブロック内にレンダリングされるタグリンク。 */
  get tagLinks(): Locator {
    return this.root.getByRole('link');
  }

  /** メタデータブロックの表示テキスト。 */
  async text(): Promise<string> {
    return this.root.innerText();
  }
}
