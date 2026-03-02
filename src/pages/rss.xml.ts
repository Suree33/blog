import rss from '@astrojs/rss';
import type { APIRoute, MarkdownInstance } from 'astro';
import config from '../config.json';
import sanitizeHtml from 'sanitize-html';

interface RssFrontmatter {
  title?: string;
  pubDate?: string;
  description?: string;
}

function hasRequiredFrontmatter(
  post: MarkdownInstance<RssFrontmatter>,
): post is MarkdownInstance<RssFrontmatter & { title: string; pubDate: string }> {
  return Boolean(post.frontmatter.title && post.frontmatter.pubDate);
}

export const GET = (async () => {
  const posts = await Promise.all(
    Object.values(
      import.meta.glob<MarkdownInstance<RssFrontmatter>>('./**/*.md', {
        eager: true,
      }),
    ),
  );

  const items = await Promise.all(
    posts.filter(hasRequiredFrontmatter).map(async (post) => ({
      title: post.frontmatter.title,
      description: post.frontmatter.description || '',
      pubDate: new Date(post.frontmatter.pubDate),
      link: post.url,
      content: sanitizeHtml(await post.compiledContent()),
    })),
  );

  return rss({
    title: config.siteName,
    description: config.description,
    site: config.url,
    stylesheet: '/rss/styles.xsl',
    items,
    customData: `<language>ja-jp</language>`,
  });
}) satisfies APIRoute;
