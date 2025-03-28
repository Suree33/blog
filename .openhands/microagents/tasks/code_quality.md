---
name: コード品質チェック
type: task
version: 1.0.0
agent: CodeActAgent
author: Suree33
inputs:
  - name: FIX_ISSUES
    description: '問題を自動修正するかどうか (yes/no)'
    required: true
  - name: TARGET_PATH
    description: 'チェック対象のパス（デフォルトは全体）'
    required: false
---

# コード品質チェックタスク

このタスクはコードベースの品質をチェックし、問題があれば修正を支援します。ESLintとPrettierを使用して、コーディング規約とフォーマットをチェックします。

## 手順

1. ESLintによるコード品質チェックを実行
2. Prettierによるフォーマットチェックを実行
3. 問題が見つかった場合は修正オプションを提示
4. 必要に応じて自動修正を適用

## 実行

### ESLintチェック

まず、ESLintを使用してコードの問題をチェックします:

```bash
bun run lint {{ TARGET_PATH || 'src' }}
```

### Prettierチェック

次に、Prettierを使用してフォーマットの問題をチェックします:

```bash
bun run format {{ TARGET_PATH || '.' }} --check
```

### 問題の修正

`FIX_ISSUES`が「yes」の場合、自動修正を試みます:

```bash
{{ FIX_ISSUES == 'yes' ? 'bun run lint:fix ' + (TARGET_PATH || 'src') : '# 自動修正はスキップされました' }}
{{ FIX_ISSUES == 'yes' ? 'bun run format ' + (TARGET_PATH || '.') : '# フォーマットはスキップされました' }}
```

### 追加の品質チェック

より包括的な品質チェックのために、以下の追加分析を行います:

1. **未使用のインポートやコンポーネントのチェック**:

   ```bash
   # eslint-plugin-unusedが設定されている場合のみ
   bun run lint:unused {{ TARGET_PATH || 'src' }}
   ```

2. **アクセシビリティチェック**:

   ```bash
   # jsx-a11y pluginが設定されている場合
   bun run lint:a11y {{ TARGET_PATH || 'src' }}
   ```

3. **型チェック**:

   ```bash
   bun run typecheck
   ```

## 品質のベストプラクティス

このプロジェクトでは以下の品質基準を維持してください:

1. **コードスタイル**:

   - 一貫したインデント（スペース2つ）
   - セミコロンの使用
   - 行の最大長は100文字

2. **命名規則**:

   - コンポーネント: PascalCase
   - 関数と変数: camelCase
   - 定数: UPPER_SNAKE_CASE
   - ファイル: コンポーネントはPascalCase、それ以外はkebab-case

3. **コメント**:
   - 複雑なロジックには説明コメントを追加
   - JSDocスタイルのコメントを使用

## 完了

コード品質チェックが完了しました。すべての問題が修正されたことを確認し、必要に応じて手動で追加の修正を行ってください。
