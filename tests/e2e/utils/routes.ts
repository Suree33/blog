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
  calloutArticle: '/posts/resolve-sidekick-nvim-codex-search-error',
  tagsBase: '/tags/',
  /** `routes.sampleArticle` の raw Markdown エンドポイント。 */
  sampleArticleMarkdown: '/posts/audio-interface-under-the-desk.md',
  rss: '/rss.xml',
  /**
   * 存在しないルート。404 ページの検証に使用する。
   *
   * 固定文字列にしておくことで、ルーティング変更時の影響を避け、
   * 「存在しない URL」という前提が常に成り立つようにする。
   */
  notFound: '/this-route-does-not-exist',
} as const;

interface PostRoute {
  route: string;
  title: string;
  highlightedCode?: Readonly<Record<string, number>>;
  imageAlt?: string;
}

/** Sätteri 移行時に記事レイアウトの適用漏れを検出する全公開記事。 */
export const allPosts = [
  {
    route: '/posts/audio-interface-under-the-desk',
    title: 'オーディオインターフェースを机の裏に設置した',
  },
  {
    route: '/posts/catppuccin-coteditor',
    title: 'CotEditor向けCatppuccinテーマを作った',
  },
  {
    route: '/posts/fan-for-my-right-hand',
    title: '手を乾かすために卓上扇風機を買った',
  },
  {
    route: '/posts/intel-core-i5-13600kf-game-crash',
    title: 'Intel Core i5-13600KFでゲームがクラッシュする問題',
  },
  {
    route: '/posts/keyboard-settings-tips',
    title: 'VIAでキーボードを設定していて知った/気がついたTips',
  },
  {
    route: '/posts/logi-mx-master-is-better-than-lift',
    title: 'Logicool MX Liftを買ってみて、MX Masterの良さを再認識した',
  },
  {
    route: '/posts/nature-remo-lapis',
    title: 'Nature Remo Lapis does not Matter with Sesame 5',
    imageAlt: 'Nature RemoアプリとAppleホームアプリのスクリーンショット',
  },
  {
    route: '/posts/nespresso-mold',
    title: 'ネスプレッソの手入れはサボるな。カビるから。',
  },
  {
    route: '/posts/perplexity-pro-is-cheaper-on-ios-app',
    title: 'Perplexity Proを契約してみた',
  },
  {
    route: '/posts/remark-link-card-plus',
    title: 'remark-link-card-plusへ移行しました',
    highlightedCode: { javascript: 1, css: 1 },
  },
  {
    route: '/posts/remark-link-card-with-astro',
    title: 'Astroにおけるremark-link-cardを使ったリンクカード',
    highlightedCode: { javascript: 1, scss: 1 },
  },
  {
    route: '/posts/resolve-sidekick-nvim-codex-search-error',
    title:
      'sidekick.nvimでCodexを使うと表示される [features].web_search_request is deprecated を解消する',
    highlightedCode: { lua: 2 },
  },
  {
    route: '/posts/setup-obsidian-livesync',
    title: 'Obsidian Syncは高いので、Self-hosted LiveSyncを使う',
  },
  {
    route: '/posts/tailscale-github-actions-to-deploy-palworld-server-docker',
    title: 'GitHub Actions × Tailscale で Palworld サーバーを自動デプロイする',
    highlightedCode: { yaml: 1 },
  },
  {
    route: '/posts/wishlist-2024-04',
    title: '欲しいものリスト 2024.04',
  },
  {
    route: '/posts/zshrc-startup-slow-cause-and-fix',
    title: '.zshrc の起動が遅い原因を Codex に調査させたら、10倍速くなった',
  },
] as const satisfies readonly PostRoute[];

/**
 * `routes.sampleArticle` が参照するサンプル記事のタイトル。
 *
 * セマンティックロケーター（`getByRole('link', { name: ... }`）や
 * タイトルアサーションに使用し、spec が DOM 構造に依存しないようにする。
 */
export const sampleArticleTitle =
  'オーディオインターフェースを机の裏に設置した';

/**
 * `routes.sampleArticle` が参照するサンプル記事の代表タグ。
 *
 * `routes.sampleArticle` がこのタグを持つため、サンプル記事リンクの表示確認に
 * 使える。タグページ spec はこのタグを代表ページとして検証する。
 */
export const sampleTag = 'ガジェット';

/**
 * `routes.sampleArticle` の frontmatter `description`。
 *
 * raw Markdown エンドポイントが frontmatter を含めて返すことを検証するために使用する。
 */
export const sampleArticleDescription =
  'オーディオインターフェースを両面テープで机の下に設置するために、突っ張り棒を使って仮固定しました。';
