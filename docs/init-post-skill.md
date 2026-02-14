# init-post スキル

## 概要

`src/pages/posts/template/_blog-post.md` を使い、新規記事ファイル `src/pages/posts/<slug>.md` を生成するためのCodexスキルです。

## 生成スクリプト

```bash
python3 .agents/skills/init-post/scripts/init_post.py --slug my-new-post
```

主なオプション:

- `--slug` (必須): 出力ファイル名（`.md` なし）
- `--title`: 記事タイトル
- `--description`: 記事説明
- `--tags`: カンマ区切りタグ（例: `"Astro,ブログ"`）
- `--date`: `pubDate`（`YYYY-MM-DD`）
- `--force`: 既存ファイル上書き

## 補足

- テンプレートの `pubDate: {{date}}` を指定日付または当日で置換します。
- 出力先に合わせて `layout` の相対パスを補正します。
