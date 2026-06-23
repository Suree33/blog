import { type Locator, type Page } from '@playwright/test';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { routes } from '../utils/routes';

/**
 * About ページ（`/about`）のページオブジェクト。
 */
export class AboutPage {
  readonly page: Page;
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.about);
  }

  /** ページの見出し（`<h1>Daiki Sato</h1>`）。 */
  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Daiki Sato' });
  }
}
