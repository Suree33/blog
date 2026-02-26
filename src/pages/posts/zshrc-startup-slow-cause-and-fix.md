---
layout: ../../layouts/MarkdownPostLayout.astro
title: ".zshrc が遅い原因を特定して、起動時間を 1.1 秒台から 0.2 秒台まで短縮した"
pubDate: 2026-02-26
tags:
  - Zsh
  - CLI
  - Performance
description: "zsh の起動が遅い問題を計測ベースで切り分け、compinit の二重実行を解消して改善した手順をまとめます。"
---
最近 `.zshrc` の起動が体感で遅くなっていたので、原因調査から修正までを一気にやった記録です。

先に結論を書くと、主因は `compinit` の重さに加えて、`compinit` が実質 2 回走る構成になっていたことでした。

## 症状

まずは素の計測。

```bash
for i in {1..5}; do /usr/bin/time zsh -i -c exit >/dev/null; done
```

この時点ではだいたい `1.0s〜1.3s`（最大で 2 秒台）でした。

## 調査手順

### 1. zprof で内訳を見る

```bash
tmp=$(mktemp -d)
cat > "$tmp/.zshrc" <<'ZPROF_EOF'
zmodload zsh/zprof
source ~/.zshrc
zprof
ZPROF_EOF
ZDOTDIR="$tmp" zsh -i -c exit
```

`compinit` / `compdump` が大半を占めていることを確認。

### 2. compinit の呼び出し元を特定

`compdump` をラップして呼び出し元を見たところ、`~/.bun/_bun` 内で `compinit` が呼ばれていました。

該当箇所（`~/.bun/_bun`）:

```zsh
if ! command -v compinit >/dev/null; then
  autoload -U compinit && compinit
fi
```

自分の `.zshrc` 側でも後段で `compinit` を呼んでいたため、二重実行に近い構成になっていました。

## 実施した修正

`.zshrc` を次の方針に変更しました。

1. `fpath` 設定の直後に `compinit -C` を実行する
2. `source ~/.bun/_bun` を `compinit` の後ろに移動する

要点は「`compinit` を先に 1 回だけ明示実行して、`_bun` 側での `compinit` 発火条件を満たさないようにする」ことです。

## 結果

修正後の計測:

- 起動時間: `0.17s〜0.39s`
- `zprof` 上の `compinit` 呼び出し回数: `1`
- `~/.zcompdump` の mtime: 連続起動で変化なし（毎回再生成しない）
- `bun` 補完: `_comps[bun]=_bun` で有効を確認

## 再現しやすいチェックリスト

- `zsh -i -c exit` を 5 回以上回して、ばらつきを見る
- `zprof` で重い関数を可視化
- 補完スクリプト（`sheldon`, `asdf`, `bun`, `fnm` など）が `compinit` を内包していないか確認
- `compinit` の位置と回数を 1 回に固定

## 補足

`compinit -C` は高速化に効きますが、補完周りで大きく構成変更したときは一度 `~/.zcompdump*` を再生成して整合性を取り直すのが安全です。
