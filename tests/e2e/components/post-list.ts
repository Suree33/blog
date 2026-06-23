import { type Locator, type Page } from '@playwright/test';
import { sampleArticleTitle } from '../utils/routes';

/**
 * Thin component wrapper for the home page article list.
 *
 * The list is a `<ul>` inside the `<main>` landmark. Tailwind's preflight sets
 * `list-style: none`, which makes Chrome drop the implicit `list` role on the
 * `<ul>`, so the root is located via the `main` landmark + `ul` selector rather
 * than `getByRole('list')`.
 */
export class PostList {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * The article list container (`<ul>` within `<main>`).
   *
   * `.first()` pins the locator to the first list even if a future page adds
   * extra `<ul>` elements inside `<main>`, keeping visual snapshots deterministic.
   */
  get root(): Locator {
    return this.page.getByRole('main').locator('ul').first();
  }

  /**
   * Link to an article in the list, located by its title text.
   *
   * Generic helper so specs can target any article, not just the sample one.
   */
  articleLink(title: string): Locator {
    return this.root.getByRole('link', { name: title });
  }

  /** Convenience accessor for the sample article link. */
  get sampleArticleLink(): Locator {
    return this.articleLink(sampleArticleTitle);
  }
}
