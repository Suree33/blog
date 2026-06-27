/**
 * E2E スイート全体で使用するルートパスを集約したもの。
 *
 * ルートを一箇所にまとめることで、URL 変更への耐性を高め、
 * テスト行列でカバーしているページを明確にする。
 */
export const routes = {
  home: '/',
  about: '/about',
  sampleArticle: '/posts/audio-interface-under-the-desk',
  rss: '/rss.xml',
  /**
   * 存在しないルート。404 ページの検証に使用する。
   *
   * 固定文字列にしておくことで、ルーティング変更時の影響を避け、
   * 「存在しない URL」という前提が常に成り立つようにする。
   */
  notFound: '/this-route-does-not-exist',
} as const;

/**
 * `routes.sampleArticle` が参照するサンプル記事のタイトル。
 *
 * セマンティックロケーター（`getByRole('link', { name: ... })`）や
 * タイトルアサーションに使用し、spec が DOM 構造に依存しないようにする。
 */
export const sampleArticleTitle =
  'オーディオインターフェースを机の裏に設置した';
