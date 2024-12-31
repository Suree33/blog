import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import config from 'src/config.json';
import type { Post } from 'src/types/Post';

export async function GET() {
  const posts: Post[] = Object.values(
    import.meta.glob('./**/*.{md,mdx}', { eager: true }),
  );
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
