import { type Locator, type Page } from '@playwright/test';

/**
 * サイトの `<header>` に対する主要なロケーターと操作をまとめる。
 *
 * POM はロケーターと小さな操作だけを持ち、検証は spec 側に書く。
 */
export class Header {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** banner ランドマーク（`<header>`）。 */
  get root(): Locator {
    return this.page.getByRole('banner');
  }

  /**
   * デスクトップの「Blog」ナビゲーションリンク。
   *
   * ヘッダーにはデスクトップ用とモバイル用の Blog リンクがある。
   * デスクトップで表示されるリンクは DOM 上で先に出るため、`.first()` で選択する。
   */
  get blogLink(): Locator {
    return this.root.getByRole('link', { name: 'Blog' }).first();
  }

  /** デスクトップの「About」ナビゲーションリンク（`.first()` の理由は `blogLink` を参照）。 */
  get aboutLink(): Locator {
    return this.root.getByRole('link', { name: 'About' }).first();
  }

  /** テーマトグルボタン（`aria-label="テーマを切り替える"`）のデスクトップ側インスタンス。 */
  get themeToggle(): Locator {
    return this.root
      .getByRole('button', { name: 'テーマを切り替える' })
      .first();
  }

  /**
   * モバイルメニューはまだ扱わない。
   *
   * ハンバーガートリガーは `<div class="hamburger">` で、`button` role や
   * アクセシブル名を持たない。テストで扱う前に、アプリ側で `<button>` と
   * `aria-label` / `aria-expanded` を追加する必要がある。
   */

  /** デスクトップの About リンクをクリックする。 */
  async gotoAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  /** テーマトグルボタンをクリックする。 */
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }
}
