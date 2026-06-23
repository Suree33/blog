/**
 * Escape a string for safe literal use inside a RegExp.
 *
 * Use this when constructing a RegExp from a dynamic value (e.g. an article
 * title) so regex metacharacters in the value are treated as literals.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches the site home URL (`/`), host-agnostic and scheme-agnostic.
 *
 * Used by navigation specs to assert that a link landed on the home page
 * regardless of the preview server host.
 */
export const HOME_URL_REGEX = /^https?:\/\/[^/]+\/$/;
