import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import remarkCodeTitles from 'remark-flexible-code-titles';
import remarkLinkCard from 'remark-link-card';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkCodeTitles,
      [
        remarkLinkCard,
        {
          cache: true,
          shortenUrl: true,
        },
      ],
    ],
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  site: 'https://sur33.com/',
  integrations: [
    tailwind({
      nesting: true,
    }),
    sitemap(),
    icon(),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
