import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import remarkCodeTitles from 'remark-flexible-code-titles';
import remarkLinkCard from 'remark-link-card';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
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
  ],
});
