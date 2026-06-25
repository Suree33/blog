/**
 * 文字列を RegExp 内で安全なリテラルとして使用できるようにエスケープする。
 *
 * 動的な値（例: 記事タイトル）から RegExp を構築する際に使用し、
 * 値に含まれる正規表現メタ文字がリテラルとして扱われるようにする。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * サイトのホーム URL（`/`）にマッチする。ホスト/スキームに依存しない。
 *
 * ナビゲーションの spec で、プレビューサーバーのホストに関わらず
 * リンクがホームページに遷移したことを検証するために使用する。
 */
export const HOME_URL_REGEX = /^https?:\/\/[^/]+\/$/;
