import { type Locator, type Page } from '@playwright/test';

/**
 * Thin component wrapper for the article metadata block (tags + dates).
 *
 * The metadata container is a `<div>` without a semantic role or `aria-label`,
 * so it is located via its stable `dot-separated` class, filtered to the
 * instance that contains a `<time>` element. This keeps the locator stable for
 * visual regression snapshots in a later phase.
 */
export class PostMetadata {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The metadata container (`<div class="dot-separated">` holding tags + time). */
  get root(): Locator {
    return this.page
      .locator('.dot-separated')
      .filter({ has: this.page.locator('time') });
  }

  /** Publication date `<time>` element. */
  get pubDate(): Locator {
    return this.root.locator('time').first();
  }

  /** Tag links rendered in the metadata block. */
  get tagLinks(): Locator {
    return this.root.getByRole('link');
  }

  /** Visible text of the metadata block. */
  async text(): Promise<string> {
    return this.root.innerText();
  }
}
