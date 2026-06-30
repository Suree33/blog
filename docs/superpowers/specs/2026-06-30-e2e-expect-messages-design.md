# E2E expect メッセージ設計

## 目的

`tests/e2e/` 配下のすべての Playwright `expect` に、アサーションの意図を示すカスタムメッセージを設定する。HTML レポートや失敗ログだけを見ても、どの期待結果を検証しているか判断できる状態にする。

## 採用方針

各 `expect` 呼び出しの近くにメッセージを直接記述する。共通ラッパーやメッセージ辞書は導入しない。直接記述なら、テストの期待結果とレポートの表示名を同じ場所で読め、変更対象も E2E コード内に限定できる。

- 通常の `expect(actual)` は `expect(actual, message)` にする。
- `expect.poll(callback)` は API 仕様に従い `expect.poll(callback, { message })` にする。
- メッセージは日本語の肯定形で、期待する状態または結果を具体的に表す。
- 同じテスト内で似たアサーションが続く場合は、初期状態・操作後・再読込後などの文脈を含めて区別する。
- ループ内では、失敗対象を特定できる範囲で記事タイトルやリンクなどの動的値を含める。
- matcher 名や実装詳細をそのまま読み上げるだけの曖昧な文言は避ける。

Playwright 公式ドキュメントでは、カスタムメッセージは成功・失敗の両方で reporter に表示され、より多くの文脈を与える用途とされている。また、`expect.poll` のメッセージは options の `message` で指定する。

## 対象

`tests/e2e/` 配下で Playwright の `expect` を呼ぶ TypeScript ファイルをすべて対象にする。spec に加え、モバイルメニューの状態待機を行う `tests/e2e/components/header.ts` も含む。既にメッセージを持つアクセシビリティ検査も、全体の文体に合わせて意図が明確か確認する。

## 検証

TypeScript AST を使った一時チェックで、通常の `expect` に第二引数があること、`expect.poll` に `message` option があることを機械的に確認する。続いて `pnpm run lint` と `pnpm run test:e2e` を実行し、型・書式・全ブラウザで既存の挙動が変わっていないことを確認する。

## 参考資料

- [Playwright Assertions: Custom expect message](https://playwright.dev/docs/test-assertions#custom-expect-message)
- [Playwright Assertions: expect.poll](https://playwright.dev/docs/test-assertions#expectpoll)
- [Playwright Best Practices: Use web first assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions)
