/**
 * Centralised route paths used across the E2E suite.
 *
 * Keeping routes in one place lets specs stay resilient to URL changes and
 * makes it obvious which pages are covered by the test matrix.
 */
export const routes = {
  home: '/',
  about: '/about',
  sampleArticle: '/posts/audio-interface-under-the-desk',
} as const;

/**
 * Title of the sample article referenced by `routes.sampleArticle`.
 *
 * Used as a semantic locator (`getByRole('link', { name: ... })`) and for title
 * assertions, so specs stay decoupled from DOM structure.
 */
export const sampleArticleTitle =
  'オーディオインターフェースを机の裏に設置した';
