# globals v17.0.0 破壊的変更の調査結果

## 概要

PR #349にて、`globals`パッケージをv16.5.0からv17.0.0にアップデートする提案がなされました。本ドキュメントは、この新バージョンにおける破壊的変更が本リポジトリに与える影響について調査した結果をまとめたものです。

## 調査日

2026年1月16日

## globals v17.0.0の破壊的変更

### 主な変更点

[公式リリースノート](https://github.com/sindresorhus/globals/releases/tag/v17.0.0)によると、以下の破壊的変更が含まれています：

- **`audioWorklet`環境の分離** ([#320](https://github.com/sindresorhus/globals/issues/320))
  - 従来、`browser`環境に含まれていた`audioWorklet`グローバル変数が、独立した環境として分離されました
  - これにより、`globals.browser`を使用している場合、audioWorklet関連のグローバル変数（`registerProcessor`、`currentFrame`、`currentTime`、`sampleRate`等）がデフォルトでは利用できなくなります

### その他の改善点

- `bunBuiltin`環境の追加
- `denoBuiltin`環境の追加
- `paintWorklet`環境の追加
- `sharedWorker`環境の追加
- ChromeとFirefoxの両方からブラウザのグローバル変数を取得するように改善

## 本リポジトリへの影響調査

### globalsの使用箇所

本リポジトリでは、`globals`パッケージを以下の箇所で使用しています：

**`eslint.config.js` (14-19行目):**
```javascript
languageOptions: {
  globals: {
    ...globals.browser,
    dataLayer: false,
  },
},
```

### audioWorklet使用状況の調査

以下のコマンドで、リポジトリ内のaudioWorklet関連コードの使用状況を確認しました：

```bash
find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.astro" \) -exec grep -l "AudioWorklet\|audioWorklet" {} \;
```

**結果**: 該当なし（audioWorklet関連のコードは使用していない）

また、audioWorklet固有のグローバル変数（`registerProcessor`、`currentFrame`、`sampleRate`等）の使用も確認しましたが、これらも使用されていないことを確認しました。

## 結論

### 影響なし

本リポジトリは**globals v17.0.0の破壊的変更の影響を受けません**。

**理由:**
1. 本リポジトリではaudioWorklet APIを一切使用していない
2. `eslint.config.js`で使用している`globals.browser`は、audioWorklet以外のブラウザグローバル変数を提供し続けている
3. 破壊的変更は`audioWorklet`環境の分離のみであり、通常のブラウザ環境での開発には影響がない

### 推奨アクション

- ✅ PR #349のマージを承認可能
- ✅ 追加の設定変更は不要
- ✅ 既存のESLint設定はそのまま機能する

### 将来の考慮事項

もし将来、本リポジトリでWeb Audio APIのAudioWorklet機能を使用する場合は、以下のように設定を更新する必要があります：

```javascript
languageOptions: {
  globals: {
    ...globals.browser,
    ...globals.audioWorklet,  // audioWorklet環境を追加
    dataLayer: false,
  },
},
```

## 参考リンク

- [globals v17.0.0 Release Notes](https://github.com/sindresorhus/globals/releases/tag/v17.0.0)
- [PR #349: build(deps-dev): bump globals from 16.5.0 to 17.0.0](https://github.com/Suree33/blog/pull/349)
- [globals Issue #320: Split audioWorklet environment from browser](https://github.com/sindresorhus/globals/issues/320)
