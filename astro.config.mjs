import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';
import remarkCodeTitles from 'remark-flexible-code-titles';
import remarkLinkCard from 'remark-link-card';

// https://astro.build/config
export default defineConfig({
  site: 'https://sur33.com/',
  redirects: {
    '/posts': '/',
  },
  vite: {
    plugins: [tailwindcss()],
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
    ],
    rehypePlugins: [rehypeCallouts],
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  integrations: [
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
