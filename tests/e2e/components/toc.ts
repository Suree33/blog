import { type Locator, type Page } from '@playwright/test';

/**
 * 記事ページの目次（`<nav aria-label="目次">`）に対するロケーターと操作。
 *
 * 記事ページではデスクトップ用（サイドバー・sticky）とモバイル用（本文内インライン）
 * の 2 つの TOC が DOM 上に存在し、ビューポート幅に応じていずれか一方だけが可視になる。
 * ヘッダーのリンク群と同様に `filter({ visible: true })` で「いま見えている」方を選び、
 * デスクトップ・モバイル両方の spec で同じ POM を使えるようにする。
 *
 * POM はロケーターと小さな操作だけを持ち、検証は spec 側に書く。
 */
export class TableOfContents {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** 可視状態の TOC ルート（`<nav aria-label="目次">`）。 */
  get root(): Locator {
    return this.page
      .getByRole('navigation', { name: '目次' })
      .filter({ visible: true });
  }

  /** TOC 内のリンク群（見出し順）。 */
  get links(): Locator {
    return this.root.getByRole('link');
  }

  /** アクセシブル名で TOC リンクを特定する。 */
  link(name: string): Locator {
    return this.root.getByRole('link', { name });
  }

  /** 現在の見出しを指すリンク（`aria-current="location"`）。 */
  get currentLink(): Locator {
    return this.root.locator('[aria-current="location"]');
  }
}