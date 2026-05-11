# Raw Markdown エンドポイント

ブログ記事の HTML ページに加えて、frontmatter を含む raw Markdown を取得できます。Astro の表示制御用 `layout` frontmatter は出力しません。

## URL

各記事の slug に `.md` を付けた URL で取得できます。

```text
/posts/foo
/posts/foo.md
```

- `/posts/foo`: 通常の HTML 記事ページ
- `/posts/foo.md`: frontmatter 込みの raw Markdown（`layout` は除外）
- `/posts/foo` または `/posts/foo/` に `Accept: text/markdown` を付けたリクエスト: frontmatter 込みの raw Markdown（`layout` は除外）

## 実装

Raw Markdown の生成は `src/pages/posts/[slug].md.ts` に集約しています。

- `import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true })` で `src/pages/posts/` 直下の記事 Markdown を文字列として読み込む
- `getStaticPaths()` で記事ごとの `slug` を列挙し、静的ビルド時に `/posts/[slug].md` を生成する
- 読み込んだ Markdown の frontmatter から `layout` 行を除去する
- `GET` は raw Markdown を `Content-Type: text/markdown; charset=utf-8` で返す

`template/_blog-post.md` や画像ディレクトリ配下のファイルは、`./*.md` の対象外です。

`/posts/[slug]/` への `Accept: text/markdown` リクエストは Cloudflare Workers の `worker/index.js` で処理します。Worker は `wrangler.toml` の `assets.run_worker_first = ["/posts/*"]` により記事 URL だけ先に実行され、該当リクエストを既存の `/posts/[slug].md` アセットに差し替えて返します。HTML と Markdown が同じ URL で変化するため、記事 URL のレスポンスには `Vary: Accept` を付与します。

## 動作確認

変更時は以下を実行してください。

```bash
pnpm run lint
pnpm run build
```
