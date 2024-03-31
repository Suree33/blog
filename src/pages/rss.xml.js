import rss, { pagesGlobToRssItems } from '@astrojs/rss';
import config from '../config.json';

export async function GET() {
  return rss({
    title: config.siteName,
    description: config.description,
    site: config.url,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>ja-jp</language>`,
  });
}
