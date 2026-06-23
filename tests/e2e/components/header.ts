import { type Locator, type Page } from '@playwright/test';

/**
 * サイトの `<header>`（暗黙的な `banner` role）を薄くラップしたコンポーネント。
 *
 * POM は薄く保つ: 安定したセマンティックロケーターと、小さなナビゲーション/
 * アクションヘルパーのみを公開する。アサーションは意図的に spec 側に置き、
 * このクラスの背後に隠さない。
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
   * ヘッダーは2つの Blog リンク（デスクトップナビ + モバイルスライドダウンメニュー）を
   * レンダリングする。デスクトップ側が DOM 上で先に現れ、デスクトップビューポートで
   * 表示されるものなので、`.first()` で決定的に選択する。
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
   * フェーズ2ではモバイルメニューは意図的に未対応。
   *
   * ハンバーガートリガーはスタイル付きの `<div class="hamburger">` であり、
   * 実際の `<button>` ではない。そのためセマンティック role やアクセシブル名を持たず、
   * `getByRole` では特定できない。フェーズ3では、安定したセマンティックロケーターを
   * ここで公開する前に、アプリ側で `<button>` + `aria-label` / `aria-expanded` への
   * アクセシビリティ対応が必要になる。
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
