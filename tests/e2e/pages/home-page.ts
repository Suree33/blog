import { type Page } from '@playwright/test';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PostList } from '../components/post-list';
import { routes } from '../utils/routes';

/**
 * ホームページ（`/`）のページオブジェクト。
 */
export class HomePage {
  readonly page: Page;
  readonly header: Header;
  readonly footer: Footer;
  readonly postList: PostList;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.postList = new PostList(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.home);
  }
}
