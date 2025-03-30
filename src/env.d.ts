import type {} from '../.astro/types.d.ts';
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly UNSPLASH_ACCESS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
