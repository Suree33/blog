# Raw Markdown エンドポイント

ブログ記事の HTML ページに加えて、frontmatter を含む raw Markdown を取得できる `.md` エンドポイントを提供しています。

## URL

各記事の slug に `.md` を付けた URL で取得できます。

```text
/posts/foo
/posts/foo.md
```

- `/posts/foo`: 通常の HTML 記事ページ
- `/posts/foo.md`: frontmatter 込みの raw Markdown

## 実装

Endpoint は `src/pages/posts/[slug].md.ts` で実装しています。

- `import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true })` で `src/pages/posts/` 直下の記事 Markdown を文字列として読み込む
- `getStaticPaths()` で記事ごとの `slug` を列挙し、静的ビルド時に `/posts/[slug].md` を生成する
- `GET` は raw Markdown を `Content-Type: text/markdown; charset=utf-8` で返す

`template/_blog-post.md` や画像ディレクトリ配下のファイルは、`./*.md` の対象外です。

## 動作確認

変更時は以下を実行してください。

```bash
pnpm run lint
pnpm run build
```
