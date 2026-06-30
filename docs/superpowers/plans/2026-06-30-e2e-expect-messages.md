# E2E expect Messages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tests/e2e/` 配下のすべての Playwright `expect` に、レポートで期待内容を判別できるカスタムメッセージを設定する。

**Architecture:** 各アサーションの呼び出し位置に日本語のメッセージを直接置き、期待結果とレポート表示を同じ場所で保守する。通常の `expect` は第二引数、`expect.poll` は第二引数の options object にある `message` を使用し、共通ラッパーは追加しない。

**Tech Stack:** TypeScript、Playwright Test、pnpm、ESLint、Astro

---

### Task 1: 全 E2E expect にカスタムメッセージを追加する

**Files:**

- Modify: `tests/e2e/components/header.ts`
- Modify: `tests/e2e/specs/accessibility.spec.ts`
- Modify: `tests/e2e/specs/navigation.spec.ts`
- Modify: `tests/e2e/specs/not-found.spec.ts`
- Modify: `tests/e2e/specs/raw-markdown.spec.ts`
- Modify: `tests/e2e/specs/rss.spec.ts`
- Modify: `tests/e2e/specs/smoke.spec.ts`
- Modify: `tests/e2e/specs/tag.spec.ts`
- Modify: `tests/e2e/specs/theme.spec.ts`
- Modify: `tests/e2e/specs/toc.spec.ts`
- Modify: `tests/e2e/specs/visual.spec.ts`
- Modify: `docs/e2e-testing.md`

- [ ] **Step 1: AST ガードを実行し、メッセージ未設定で失敗することを確認する**

次の一時チェックを実行する。通常の `expect` は引数が2個以上、`expect.poll` は第二引数が object literal かつ `message` property を持つことを要求する。

```bash
node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = 'tests/e2e';
const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && target.endsWith('.ts')) files.push(target);
  }
};
walk(root);

const missing = [];
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const directExpect = ts.isIdentifier(node.expression) && node.expression.text === 'expect';
      const pollExpect =
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'expect' &&
        node.expression.name.text === 'poll';
      if (directExpect && node.arguments.length < 2) {
        missing.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1} expect second argument`);
      }
      if (pollExpect) {
        const options = node.arguments[1];
        const hasMessage =
          options &&
          ts.isObjectLiteralExpression(options) &&
          options.properties.some(
            (property) =>
              ts.isPropertyAssignment(property) &&
              ((ts.isIdentifier(property.name) && property.name.text === 'message') ||
                (ts.isStringLiteral(property.name) && property.name.text === 'message')),
          );
        if (!hasMessage) {
          missing.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1} expect.poll message option`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (missing.length > 0) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log('All Playwright expect calls under tests/e2e have custom messages.');
NODE
```

Expected: `tests/e2e/... expect second argument` と `expect.poll message option` が列挙され、exit code 1 で失敗する。

- [ ] **Step 2: 各 expect に最小限で具体的なメッセージを追加する**

通常のアサーションは次の形にする。

```typescript
await expect(page, 'Blog リンクからホームページに遷移する').toHaveURL(
  HOME_URL_REGEX,
);
```

ポーリングは次の形にする。

```typescript
await expect
  .poll(() => page.evaluate(() => localStorage.getItem('theme')), {
    message: 'ダークテーマ選択後は theme に dark が保存される',
  })
  .toBe('dark');
```

ループ内の汎用アサーションは対象値を含める。

```typescript
expect(item.title, `RSS item (${item.link}) のタイトルが空でない`).not.toBe(
  '',
);
```

`docs/e2e-testing.md` の POM 方針付近に、全 `expect` へ期待結果を表すカスタムメッセージを付け、`expect.poll` では options の `message` を使う運用ルールと公式 Assertions へのリンクを追記する。

- [ ] **Step 3: AST ガードを再実行して通過を確認する**

Step 1 と同じコマンドを実行する。

Expected: `All Playwright expect calls under tests/e2e have custom messages.` と表示され、exit code 0。

- [ ] **Step 4: lint と E2E 全体を実行する**

```bash
pnpm run lint
pnpm run test:e2e
```

Expected: lint が exit code 0。E2E は 152 passed / 28 skipped、0 failed。

- [ ] **Step 5: 差分を自己レビューしてコミットする**

```bash
git diff --check
git diff -- tests/e2e docs/e2e-testing.md
git add tests/e2e docs/e2e-testing.md
git commit -m "test: E2E expectに説明メッセージを追加"
```

コミットには次の trailer を1回だけ含める。

```text
Co-authored-by: Codex <noreply@openai.com>
```
