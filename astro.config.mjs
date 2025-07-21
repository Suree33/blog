import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';
import remarkCodeTitles from 'remark-flexible-code-titles';
import remarkLinkCard from 'remark-link-card';
import remarkAutoToc from './src/plugins/remark-auto-toc.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://sur33.com/',
  redirects: {
    '/posts': '/',
  },
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
      [
        remarkAutoToc,
        {
          maxDepth: 3,
          tight: true,
        },
      ],
    ],
    rehypePlugins: [rehypeCallouts],
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    icon(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
