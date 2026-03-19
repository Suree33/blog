# テーマ切り替え機能

## 概要

ヘッダーにテーマ切り替えボタンを実装しました。ボタンをクリックすると、以下の3つの状態を順に切り替えることができます:

1. **system** - OSの設定に従う（デフォルト）
2. **light** - ライトモード
3. **dark** - ダークモード

## 実装内容

### 1. テーマ管理スクリプト (`src/scripts/theme.ts`)

テーマの状態管理と切り替えロジックを提供するモジュールです。

**主要な機能:**
- `getStoredTheme()` - localStorageから保存されたテーマ設定を取得
- `setStoredTheme(theme)` - localStorageにテーマ設定を保存
- `getSystemTheme()` - OSのカラースキーム設定を取得
- `resolveTheme(theme)` - テーマ設定を解決（systemの場合はOS設定を参照）
- `applyTheme(theme)` - HTMLのルート要素にdarkクラスを適用/削除
- `cycleTheme()` - テーマを次の状態に切り替え（system → light → dark → system）
- `initThemeToggle(buttonSelector)` - テーマ切り替えボタンの初期化

**データ永続化:**
- テーマ設定は`localStorage`に`theme-preference`キーで保存
- localStorageはクリアされない限り永続的に保持される

### 2. ThemeToggleコンポーネント (`src/components/ThemeToggle.astro`)

テーマ切り替えボタンのUIコンポーネントです。

**特徴:**
- 太陽アイコン（ライトモード時に表示）
- 月アイコン（ダークモード時に表示）
- アクセシビリティ対応（`aria-label`付き）
- Tailwind CSSでスタイリング

### 3. Headerコンポーネントの更新 (`src/components/Header.astro`)

**変更点:**
- `ThemeToggle`コンポーネントをインポート
- デスクトップビューとモバイルビューの両方に配置
- テーマ切り替えボタンを初期化するスクリプトを追加

**配置:**
- デスクトップ: ソーシャルアイコンの左側
- モバイル: ハンバーガーメニューの左側

### 4. BaseLayoutの更新 (`src/layouts/BaseLayout.astro`)

**FOUC（Flash of Unstyled Content）防止:**
- ページ読み込み時に即座にテーマを適用するインラインスクリプトを追加
- スクリプトは`<head>`内に配置し、DOMの構築前に実行される
- localStorageから保存されたテーマ設定を読み込み、適切にdarkクラスを適用

## テーマの動作

### system（システム設定）
- OSのカラースキーム設定に従う
- `prefers-color-scheme: dark`メディアクエリで判定
- OSの設定が変更された場合、自動的に反映される

### light（ライトモード）
- 常にライトモードで表示
- OSの設定に関わらず固定

### dark（ダークモード）
- 常にダークモードで表示
- OSの設定に関わらず固定

## 使用方法

### ユーザー操作
1. ヘッダーの太陽/月アイコンボタンをクリック
2. クリックするたびにテーマが切り替わる
3. 設定は自動的に保存され、次回訪問時にも維持される

### 開発者向け

テーマを手動で設定する場合:

```typescript
import { setStoredTheme, applyTheme } from '../scripts/theme';

// テーマを設定して適用
setStoredTheme('dark');
applyTheme('dark');
```

現在のテーマを取得する場合:

```typescript
import { getStoredTheme } from '../scripts/theme';

const currentTheme = getStoredTheme(); // 'system' | 'light' | 'dark'
```

## 技術的な詳細

### Tailwind CSSとの連携
- Tailwind CSSの`dark:`バリアントを使用
- `html`要素に`dark`クラスが付与されることで、ダークモードが有効化
- Tailwind CSSは`class`ストラテジーをデフォルトで使用（メディアクエリではなくクラスベース）

### パフォーマンス最適化
- インラインスクリプトによりFOUCを完全に防止
- localStorageの読み書きは最小限に抑制
- イベントリスナーは適切に登録・管理

## 注意事項

- localStorageを使用しているため、プライベートブラウジングモードでは正常に動作しない場合がある
- JavaScriptが無効の場合、テーマ切り替えは機能せず、systemモード（OS設定）にフォールバックする
