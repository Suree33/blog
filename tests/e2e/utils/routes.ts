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
  /** `routes.sampleArticle` の raw Markdown エンドポイント。 */
  sampleArticleMarkdown: '/posts/audio-interface-under-the-desk.md',
} as const;

/**
 * `routes.sampleArticle` が参照するサンプル記事のタイトル。
 *
 * セマンティックロケーター（`getByRole('link', { name: ... }`）や
 * タイトルアサーションに使用し、spec が DOM 構造に依存しないようにする。
 */
export const sampleArticleTitle =
  'オーディオインターフェースを机の裏に設置した';

/**
 * `routes.sampleArticle` の frontmatter `description`。
 *
 * raw Markdown エンドポイントが frontmatter を含めて返すことを検証するために使用する。
 */
export const sampleArticleDescription =
  'オーディオインターフェースを両面テープで机の下に設置するために、突っ張り棒を使って仮固定しました。';
