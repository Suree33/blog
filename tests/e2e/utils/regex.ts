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
