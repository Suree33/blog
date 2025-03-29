/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts,astro}'],
    exclude: ['node_modules', 'dist', '.astro', '.git'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});