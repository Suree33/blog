import rss from '@astrojs/rss';
import config from '../config.json';
import sanitizeHtml from 'sanitize-html';

export async function GET() {
  const posts = await Promise.all(
    Object.values(import.meta.glob('./**/*.md', { eager: true }))
  );

  return rss({
    title: config.siteName,
    description: config.description,
    site: config.url,
    stylesheet: '/rss/styles.xsl',
    items: posts
      .filter(post => post.frontmatter.title && post.frontmatter.pubDate)
      .map((post) => ({
        title: post.frontmatter.title,
        description: post.frontmatter.description || '',
        pubDate: new Date(post.frontmatter.pubDate),
        link: post.url,
        content: sanitizeHtml(post.compiledContent()),
      })),
    customData: `<language>ja-jp</language>`,
  });
}
