import { type Locator, type Page } from '@playwright/test';

/**
 * Thin component wrapper for the site `<footer>` (implicit `contentinfo` role).
 */
export class Footer {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The contentinfo landmark (`<footer>`). */
  get root(): Locator {
    return this.page.getByRole('contentinfo');
  }

  get blogLink(): Locator {
    return this.root.getByRole('link', { name: 'Blog' });
  }

  get aboutLink(): Locator {
    return this.root.getByRole('link', { name: 'About' });
  }

  /** RSS feed link (`aria-label="RSS feed"`). */
  get rssLink(): Locator {
    return this.root.getByRole('link', { name: 'RSS feed' });
  }
}
