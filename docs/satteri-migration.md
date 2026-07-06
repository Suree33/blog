# Sätteri移行

Astro v7の標準Markdown処理系であるSätteriへ移行し、unified用プラグインで提供している表示機能をローカル拡張として段階的に復元します。意思決定の背景は [ADR-0001](./adr/0001-use-satteri-with-local-markdown-plugins.md) を参照してください。

## 移行の境界

初回のSätteri切り替え時に一時的な退行を許容するのは、次の3機能だけです。

- Callout
- コードタイトル
- リンクカード

次の動作は全段階で維持します。

- Markdown投稿のレイアウト
- 見出しIDと目次
- Shikiのシンタックスハイライト
- 画像の処理
- RSS
- `/posts/[slug].md` のraw Markdown応答
- `Accept: text/markdown` によるCloudflare Workerのcontent negotiation

機能復元時はMarkdownの記法と表示上の意味を保ちます。生成HTMLの内部構造は旧プラグインと完全一致させる必要はありません。

## 移行段階

4つの変更をそれぞれ独立したPRとし、`chore/migrate-satteri` をベースブランチとして順番にマージします。`main` へは全段階の完了後にマージし、一時退行を本番へ入れません。

### 1. Sätteriへ切り替え

現在のブランチではこの段階を実装済みです。`astro.config.mjs` では processor を指定せず、Astro v7のデフォルトSätteriを利用します。全投稿と記事テンプレートは `layout: '@layouts/MarkdownPostLayout.astro'` を明示し、コードフェンスのタイトルは `lang title=...` 形式です。

- `markdown.processor` の明示指定を外し、Astro v7のデフォルトSätteriを使う
- 各投稿に `layout` frontmatterを追加し、remarkによる自動注入を置き換える
- コードフェンスを `lang:title` から `lang title=...` へ移行し、タイトル表示がない期間も言語別ハイライトを保つ
- `@astrojs/markdown-remark`、`remark-flexible-code-titles`、`remark-link-card-plus` を削除する
- `rehype-callouts` はテーマCSSのimport元としてCallout復元まで一時的に残す
- Workersプレビューで `Accept: text/markdown` のcontent negotiationを自動テストする

検証は `pnpm run test:e2e -- --project=chromium` と `pnpm run test:e2e:workers` で行います。

#### unified版との出力比較

初回切り替え時に、移行前後の全16記事のビルド済みHTMLをDOMとして比較しました。Callout、コードタイトル、リンクカードを同じプレースホルダーへ正規化すると16件すべてが一致し、許容済み3機能以外の差分はありませんでした。raw Markdownの差分は、7コードフェンスの `lang title=...` 移行と、一部ファイルへの末尾改行追加だけです。比較用生成物はコミットしません。リンクカードが通常リンクへ戻ったことで記事列の幅が変わる4プロジェクトについては、記事メタデータのビジュアルスナップショットを一時状態へ更新しました。

### 2. Calloutを復元

この段階を実装済みです。`src/lib/markdown/callout.ts` のローカルHASTプラグインを、Astro公式の `satteri()` 設定から読み込みます。

- 非折りたたみの `INFO`、`NOTE`、`WARNING` を `<div>` のCalloutへ変換する
- 種類は `data-callout`、アクセシブル名は `aria-label` で識別する
- 未対応種類、`[!INFO]+` などの折りたたみ記法、通常の引用はblockquoteとして残す
- GitHub風テーマとダークテーマ対応を `src/styles/callout.css` で所有する
- 旧 `rehype-callouts` のCSS importと依存は削除済み
- `vitest.config.ts` はAstro公式の `getViteConfig()` を使用する

変換の単体テストは `pnpm run test:unit`、記事表示の統合テストは `pnpm exec playwright test tests/e2e/specs/callout.spec.ts --project=chromium` で実行します。GitHub Actionsではunit testを独立ジョブとして実行します。

### 3. コードタイトルを復元

- SätteriからShikiへ渡る `title=...` メタデータを使う
- ローカルShiki transformerとして実装する
- 既存のシンタックスハイライトとテーマを保つ
- CSSファイル名とクラス名から旧実装由来の `remark-` を外す

### 4. リンクカードを復元

- ローカルSätteriプラグインとして実装する
- CSSファイル名とクラス名から `remark-link-card-plus` 由来の命名を外す
- 段落内に単独で置かれたHTTP(S)リンクだけをカード化する
- インラインリンク、リスト内リンク、非HTTP(S)リンクは変換しない
- カードは新しいタブで開き、`rel="noreferrer noopener"` を付ける
- 画像キャッシュは `public/link-card/` に保存し、公開URLを `/link-card/...` とする
- 画像キャッシュはGit管理外とする
- OGメタデータはキャッシュせず、ビルドごとに取得する
- OG解析に `open-graph-scraper`、画像形式判定に `file-type` を直接依存として使う
- 外部ページと画像の取得タイムアウトは10秒とする
- 外部取得失敗時もカードのスタイルは保つ
- 失敗時はURLをタイトルとし、faviconとサムネイルを表示しない
- ページ取得に成功している場合は、個別の画像取得が失敗しても取得済みのメタデータと画像を使う
- 外部取得失敗を理由にビルドを失敗させない

## テスト方針

- ローカル拡張は `src/lib/markdown/` に配置し、Vitestのテストを各実装の隣に置く
- ローカル拡張のMarkdown変換はVitestで単体テストする
- `pnpm run test:unit` でVitestを実行し、GitHub Actionsの独立したunit testジョブで必須化する
- AstroとCSSを含む表示は代表記事のPlaywright E2Eで確認する
- raw Markdown URLはAstroプレビュー、content negotiationはWorkersプレビューで検証する
- Workers検証は専用のPlaywright設定と `pnpm run test:e2e:workers` に分け、GitHub Actionsの専用ジョブで実行する
- Workers検証はMarkdown/HTMLの選択、`q` 値、ワイルドカード、同率時の記述順、`Vary: Accept`、`HEAD` を対象とする
- 初回切り替え時は全16記事をChromiumで1回ずつ巡回し、HTTP 200、記事レイアウト、`h1` を確認する
- リンクカードのVitestでは外部通信をモックする
- 各段階で `pnpm run lint`、ビルド、対象テストを実行する
- 初回切り替えPRでunified版とSätteri版の全Markdownページのビルド結果を比較し、3つの許容済み機能以外の差分をPR説明に記録する
