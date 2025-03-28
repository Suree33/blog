---
name: GitHubリリース作成
type: task
version: 1.0.0
agent: CodeActAgent
author: Suree33
inputs:
  - name: VERSION
    description: 'リリースバージョン（例: v1.0.0）'
    required: true
  - name: RELEASE_NOTES
    description: 'リリースノート'
    required: true
  - name: TAG_NAME
    description: 'タグ名（指定しない場合はバージョンが使用されます）'
    required: false
  - name: PRERELEASE
    description: 'プレリリースとして作成するかどうか (true/false)'
    required: false
---

# GitHubリリース作成タスク

このタスクはGitHub CLIを使用して、ソフトウェアのリリースを作成します。セマンティックバージョニング、リリースノート、タグ作成などのベストプラクティスに従います。

## 手順

1. リポジトリが最新の状態かを確認
2. タグを作成
3. リリースノートを準備
4. GitHub CLIでリリースを作成
5. リリースを検証

## 実行

### リポジトリの状態確認

まず、リポジトリが最新の状態であることを確認します:

```bash
git checkout main
git pull origin main
```

### タグの作成

リリース用のタグを作成します:

```bash
# タグ名を決定
TAG={{ TAG_NAME || VERSION }}

# ローカルタグを作成
git tag -a $TAG -m "Release $TAG"

# リモートにタグをプッシュ
git push origin $TAG
```

### リリースの作成

GitHub CLIを使用してリリースを作成します:

```bash
# プレリリースフラグの設定
PRERELEASE_FLAG={{ PRERELEASE == 'true' ? '--prerelease' : '' }}

# リリース作成
gh release create $TAG --title "{{ VERSION }}" --notes "{{ RELEASE_NOTES }}" $PRERELEASE_FLAG
```

### リリースアセットの追加（オプション）

ビルド成果物をリリースに追加できます:

```bash
# ビルドディレクトリがある場合に実行
if [ -d "dist" ]; then
  # ZIPアーカイブの作成
  zip -r $TAG-build.zip dist
  
  # リリースにアセットをアップロード
  gh release upload $TAG $TAG-build.zip
fi
```

### リリースの確認

作成されたリリースをブラウザで確認します:

```bash
gh release view $TAG --web
```

## リリースノートの作成ガイド

効果的なリリースノートには以下の要素を含めることをお勧めします:

1. **変更の概要**: 主要な変更点を簡潔に説明
2. **新機能**: 追加された新機能のリスト
3. **バグ修正**: 修正されたバグのリスト
4. **破壊的変更**: 下位互換性がない変更の詳細
5. **アップグレード手順**: 必要なアップグレード手順

例：

```markdown
## 新機能
- ダークモードのサポートを追加
- パフォーマンス改善で読み込み時間が50%短縮

## バグ修正
- モバイル表示時のレイアウト崩れを修正
- APIレスポンスのエラーハンドリングを改善

## 破壊的変更
- 設定ファイルのフォーマットが変更されました。詳細はドキュメントを参照してください。
```

## セマンティックバージョニング

リリースバージョンには[セマンティックバージョニング](https://semver.org/lang/ja/)の使用を推奨します:

- **メジャーバージョン (X.0.0)**: 互換性のない変更
- **マイナーバージョン (0.X.0)**: 後方互換性のある機能追加
- **パッチバージョン (0.0.X)**: 後方互換性のあるバグ修正

## 完了

リリースが正常に作成されました。次のステップ:

1. リリースページで詳細が正しく表示されていることを確認
2. 必要に応じてリリースノートを編集
3. ユーザーコミュニティにリリースを通知
