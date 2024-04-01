import rss, { pagesGlobToRssItems } from '@astrojs/rss';
import config from '../config.json';
import sanitizeHtml from 'sanitize-html';

export async function GET() {
  const postImportResult = import.meta.glob('./**/*.md', { eager: true });
  const posts = Object.values(postImportResult);
  return rss({
    title: config.siteName,
    description: config.description,
    site: config.url,
    stylesheet: '/rss/styles.xsl',
    items: posts.map((post) => ({
      link: post.url,
      content: sanitizeHtml(post.compiledContent()),
      ...post.frontmatter,
    })),
    customData: `<language>ja-jp</language>`,
  });
}
