import { type Locator, type Page } from '@playwright/test';

/**
 * Thin component wrapper for the site `<header>` (implicit `banner` role).
 *
 * The POM stays thin: it exposes stable semantic locators and a couple of tiny
 * navigation/action helpers. Assertions deliberately live in the specs rather
 * than being hidden behind this class.
 */
export class Header {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The banner landmark (`<header>`). */
  get root(): Locator {
    return this.page.getByRole('banner');
  }

  /**
   * Desktop "Blog" navigation link.
   *
   * The header renders two Blog links (desktop nav + mobile slide-down menu);
   * the desktop one appears first in the DOM and is the visible one on desktop
   * viewports, so `.first()` selects it deterministically.
   */
  get blogLink(): Locator {
    return this.root.getByRole('link', { name: 'Blog' }).first();
  }

  /** Desktop "About" navigation link (see `blogLink` for `.first()` rationale). */
  get aboutLink(): Locator {
    return this.root.getByRole('link', { name: 'About' }).first();
  }

  /** Theme toggle button (`aria-label="テーマを切り替える"`), desktop instance. */
  get themeToggle(): Locator {
    return this.root
      .getByRole('button', { name: 'テーマを切り替える' })
      .first();
  }

  /**
   * Mobile menu support is intentionally omitted in Phase 2.
   *
   * The hamburger trigger is a styled `<div class="hamburger">` rather than a
   * real `<button>`, so it has no semantic role or accessible name and cannot
   * be located via `getByRole`. Phase 3 will need app-side accessibility work
   * (e.g. converting it to a `<button>` with an `aria-label` / `aria-expanded`)
   * before a stable, semantic locator can be exposed here.
   */

  /** Click the desktop About link. */
  async gotoAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  /** Click the theme toggle button. */
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }
}
