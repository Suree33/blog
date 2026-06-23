import { type Locator, type Page } from '@playwright/test';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PostMetadata } from '../components/post-metadata';
import { routes, sampleArticleTitle } from '../utils/routes';

/**
 * Page object for a blog article page.
 *
 * `goto()` defaults to the sample article route/title; specs can pass another
 * route (with its title) to test a different article. The expected title is
 * tracked internally so `heading` stays in sync with the route that was
 * navigated to.
 */
export class ArticlePage {
  readonly page: Page;
  readonly header: Header;
  readonly footer: Footer;
  readonly metadata: PostMetadata;

  private currentTitle: string = sampleArticleTitle;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.metadata = new PostMetadata(page);
  }

  /**
   * Navigate to an article route.
   *
   * @param route Article URL, defaults to the sample article route.
   * @param title Expected `<h1>` text for the route, used by `heading`. Must
   *   match the article rendered at `route`.
   */
  async goto(
    route: string = routes.sampleArticle,
    title: string = sampleArticleTitle,
  ): Promise<void> {
    this.currentTitle = title;
    await this.page.goto(route);
  }

  /** The article title heading (`<h1>`), located by the expected title. */
  get heading(): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: this.currentTitle,
    });
  }
}
