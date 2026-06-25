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
  tagsBase: '/tags/',
} as const;

/**
 * `routes.sampleArticle` が参照するサンプル記事のタイトル。
 *
 * セマンティックロケーター（`getByRole('link', { name: ... })`）や
 * タイトルアサーションに使用し、spec が DOM 構造に依存しないようにする。
 */
export const sampleArticleTitle =
  'オーディオインターフェースを机の裏に設置した';

/**
 * `routes.sampleTag` が参照するサンプル記事の代表タグ。
 *
 * `routes.sampleArticle` がこのタグを持つため、サンプル記事リンクの表示確認に
 * 使える。タグページ spec はこのタグを代表ページとして検証する。
 */
export const sampleTag = 'ガジェット';
