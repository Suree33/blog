# axe-core アクセシビリティ E2E 設計

## 目的

Issue #566 として、Playwright E2E に axe-core の自動アクセシビリティ検査を追加する。ホーム、About、代表記事の主要3ページをデスクトップとモバイル、ライトテーマとダークテーマで検査し、重大な問題の再混入を CI で防ぐ。

自動検査でアクセシビリティ全体を保証することは目的としない。axe-core が機械的に判定できる問題を継続的に検出し、手動確認が必要な問題や判定不能な項目は検査結果から追跡できる状態を作る。

## 対象範囲

- ホーム (`/`)
- About (`/about`)
- 代表記事 (`/posts/audio-interface-under-the-desk`)
- Playwright の `chromium` project（デスクトップ）
- Playwright の `Mobile Chrome` project（モバイル）
- ライトテーマとダークテーマ
- axe-core の既定ルールすべて
- `serious` / `critical` の違反を CI の失敗条件とする
- 全スキャン結果を Playwright レポートへ JSON 添付する

## 対象外

- 全ページ・全記事の網羅的な検査
- Firefox、WebKit、Mobile Safari での重複実行
- キーボード操作、スクリーンリーダー、認知的な分かりやすさなどの手動評価
- ARIA snapshot によるアクセシビリティツリー全体の固定
- 既知違反を許可する snapshot、`exclude()`、`disableRules()` の初期導入
- axe-core が返す `minor` / `moderate` の違反による CI 失敗

## 検討した方式

### 1. 専用 spec を追加する（採用）

`tests/e2e/specs/accessibility.spec.ts` にページ遷移、テーマ切り替え、axe実行、結果添付、重大度判定を集約する。

既存のスモークテストと責務を分離でき、axe固有の結果処理や対象 project の制御を一箇所で理解できる。対象が3ページの現時点では、共通 fixture をaxe向けに拡張せず、spec内の小さなヘルパーに閉じ込める方が単純である。

### 2. a11y 専用 Playwright project を追加する

デスクトップ用とモバイル用の専用 project を定義し、`testMatch` / `testIgnore` でaxe specを振り分ける方式。

実行行列は設定ファイル上で明確になる一方、既存6 projectとの除外設定や重複する端末設定が増える。3ページだけを対象とする今回の規模では設定コストが上回るため採用しない。

### 3. 既存スモークテストへ組み込む

既存のページ遷移を再利用できるが、基本表示の確認とアクセシビリティ検査の失敗が混在する。結果添付、重大度フィルター、対象 project の制御もスモークテストへ流入するため採用しない。

## ファイル構成

### `package.json` / `pnpm-lock.yaml`

`@axe-core/playwright` を devDependency として追加する。既存devDependencyと同じバージョン範囲の運用に従い、実際に CI で使う解決済みバージョンはlockfileで固定する。

`axe-core` は現在 `eslint-plugin-jsx-a11y` の推移依存としてlockfileに存在するが、Playwright連携APIは提供しない。テストコードから直接利用する `@axe-core/playwright` を明示的なdevDependencyにする。

### `tests/e2e/specs/accessibility.spec.ts`

次の責務だけを持つ専用 spec を追加する。

1. `chromium` と `Mobile Chrome` 以外を明示的に skip する。
2. 既存の `homePage`、`aboutPage`、`articlePage` fixtureで対象ページへ移動する。
3. 各ページについてライト・ダークの順で配色をエミュレートする。
4. モバイルでは各ページ読み込み後にハンバーガーメニューを開く。
5. axe-core の既定ルールでページ全体をスキャンする。
6. テーマごとの完全な結果をJSONとしてテストへ添付する。
7. 両テーマのスキャン完了後、重大な違反だけをまとめてassertする。

specはページごとに1テスト、計3テストを定義する。各テスト内で2テーマを検査するため、実行対象2 projectを合わせて合計12スキャンになる。

### `docs/e2e-testing.md`

次の内容を追記・更新する。

- ディレクトリ構成へ `accessibility.spec.ts` を追加
- 対象3ページ、対象2 project、2テーマの検査行列
- axe-core の既定ルールを使うこと
- `serious` / `critical` だけを失敗条件にすること
- 全結果がPlaywrightレポートへJSON添付されること
- 自動検査だけではすべてのアクセシビリティ問題を検出できないこと
- 「今後の拡張候補」からaxe-core導入の項目を削除

## テストフロー

各ページテストは以下の順で動作する。

1. 現在の Playwright project が `chromium` または `Mobile Chrome` か判定し、対象外ならskipする。
2. ライトテーマを `page.emulateMedia()` で指定する。
3. 対象ページへ遷移する。
4. `Mobile Chrome` の場合はモバイルメニューを開く。
5. `AxeBuilder` でページ全体を解析する。
6. `axe-results-light.json` として完全な結果を添付する。
7. ダークテーマについて手順2〜6を繰り返し、`axe-results-dark.json` を添付する。
8. 2回分の `violations` から `impact` が `serious` または `critical` の項目を抽出する。
9. 抽出結果が空であることをassertする。

テーマはlocalStorageの保存値を操作せず、既存CSSが対応している `prefers-color-scheme` のエミュレーションで決定する。テーマごとにページを読み直すことで、初期描画から目的の配色を適用し、前のスキャンのDOM状態を持ち越さない。

モバイルメニューは閉じた状態では非表示要素としてaxeの対象外になる可能性があるため、Mobile Chromeでは開いた状態を検査する。デスクトップの通常ナビゲーションは `chromium` の初期表示で検査する。

## 違反判定とレポート

axe-core は既定ルールすべてを実行する。WCAGタグで対象を固定せず、axe-coreが提供するbest-practiceを含めて検査する。依存更新で新しいルールが追加された場合はlockfile更新時に検査範囲の変化としてレビューする。

CIの失敗判定は以下に限定する。

- `serious`
- `critical`

`minor` と `moderate` はCIを失敗させないが、完全なaxe結果に含める。`incomplete`、`passes`、`inapplicable` も同じJSONに残り、Playwright HTMLレポートとartifactから確認できる。

assertへ渡す値は完全な `violations` 配列ではなく、次の情報に絞った診断用データとする。

- テーマ
- ルールID
- impact
- 違反ノードのtarget（CSS selector）

これによりActions annotationと標準出力を読みやすく保ち、HTML断片や長い説明などの詳細は添付JSONへ分離する。

## エラー処理

- ページ遷移、モバイルメニュー展開、axe解析、JSON添付が例外を投げた場合は通常のPlaywright失敗として扱う。
- axe結果を取得できた場合は、ライト側に重大違反があっても直ちにassertせず、ダーク側の解析と添付を終えてからまとめて失敗させる。
- 初期実装では `exclude()` や `disableRules()` を設けない。安定して再現する既知違反を一時的に許可する必要が生じた場合は、対象を最小化し、理由と追跡Issueをコードとドキュメントに残す。
- axe-coreの自動判定結果がゼロでもアクセシビリティ適合を保証しないことをドキュメントに明記する。

## CIと実行時間

既存の `pnpm run test:e2e` に専用 spec を含め、GitHub Actionsのジョブやコマンドは増やさない。既存6 projectのうち4 projectでは3テストがskipされ、`chromium` と `Mobile Chrome` でのみ実行される。

新規スキャンは12回だが、対象は静的な3ページであり、ブラウザーの種類を2つに絞る。全6 projectで同じaxeルールを重複実行する方式よりCI時間と結果ノイズを抑える。

## 検証

実装後は次の順で確認する。

1. `pnpm exec playwright test tests/e2e/specs/accessibility.spec.ts`
   - `chromium` と `Mobile Chrome` で3ページが実行される。
   - 他4 projectは明示的にskipされる。
   - 各実行にライト・ダークのJSON結果が添付される。
   - `serious` / `critical` の違反がない。
2. `pnpm run lint`
   - ESLint、Astro check、TypeScript型チェックが成功する。
3. `pnpm run test:e2e`
   - 既存テストを含む全E2Eが成功する。
   - HTMLレポートからaxe結果を確認できる。

## 完了条件

- `@axe-core/playwright` が明示的なdevDependencyとして追加されている。
- ホーム、About、代表記事がPC・モバイル、ライト・ダークで検査される。
- axe-coreの既定ルールが実行される。
- `serious` / `critical` の違反でE2Eが失敗する。
- 全スキャン結果がPlaywrightレポートへJSON添付される。
- `docs/e2e-testing.md` に導入方法、検査範囲、限界が記載されている。
- lintと全E2Eが成功する。
