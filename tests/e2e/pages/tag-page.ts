import { type Locator, type Page } from '@playwright/test';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PostList } from '../components/post-list';
import { routes, sampleTag } from '../utils/routes';
import { escapeRegExp } from '../utils/regex';

/**
 * タグページ（`/tags/[tag]`）のページオブジェクト。
 *
 * `goto()` のデフォルトは代表タグ（サンプル記事が持つタグ）。spec から別のタグを
 * 渡すことで、他のタグページもテストできる。期待タグ名は内部で保持し、`heading` が
 * 遷移先のタグと同期するようにする（タグページの `<h1>` は `{tag}のタグが付いた記事`）。
 */
export class TagPage {
  readonly page: Page;
  readonly header: Header;
  readonly footer: Footer;
  readonly postList: PostList;

  private currentTag: string = sampleTag;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.postList = new PostList(page);
  }

  /**
   * タグページへ遷移する。
   *
   * @param tag タグ名。`/tags/{tag}` へ遷移する。デフォルトは代表タグ。
   */
  async goto(tag: string = sampleTag): Promise<void> {
    this.currentTag = tag;
    await this.page.goto(`${routes.tagsBase}${encodeURIComponent(tag)}`);
  }

  /**
   * ページの見出し（`<h1>{tag}のタグが付いた記事</h1>`）。
   *
   * `goto()` で指定したタグ名をアクセシブル名に含む `<h1>` で特定する。
   */
  get heading(): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: new RegExp(escapeRegExp(this.currentTag)),
    });
  }
}
