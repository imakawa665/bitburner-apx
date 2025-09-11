[![License](https://img.shields.io/github/license/imakawa665/bitburner-apx)](LICENSE)
[![Release](https://img.shields.io/github/v/release/imakawa665/bitburner-apx)](https://github.com/imakawa665/bitburner-apx/releases)

# bitburner-apx (Lily build)

軽量・高効率の Bitburner スクリプト集(AI生成）です（Singularity不要の構成も多数）。
**すぐに使える**ことと、**RAM極小**を最優先に設計しています。

## ディレクトリ

- `core/`
  - `apx-core.nano.v2.06.js` — 低RAMオートパイロット（Singularity非依存）
  - `apx-core.micro.v2.07.js` — 8GB向けチューニング版
  - `apx-core.micro.v2.08.js` — root済みサーバを自動ターゲットに含める（`--allRooted true`）
- `singularity/`
  - `apx-autopilot.v2.05.js` — Singularity自動化（犯罪/ジム/大学）
  - `apx-sing-actions.js` — Singularity安全ラッパ
  - `apx-remote-send.js` — Port 20 にコマンド送信するテスター
- `rooter/`
  - `apx-root0.js` — 0ポート鯖一括NUKE
  - `apx-rooter.nano.v1.js` — 超軽量一括ルーター（0〜5ポート対応）
  - `apx-rooter.auto.v1.js` — 常駐ルーター（Hack/プログラム取得を検知）
- `workers/`
  - `apx-w1.js` / `apx-g1.js` / `apx-h1.js` — 単発ワーカー
  - `apx-loop-hgw.nano.js` — 買収サーバ向けHGWループ
- `tools/`
  - `apx-backdoor.guide.v1.js` — バックドア最短`connect`ガイド（Singularity不要）
  - `apx-pserv.nano.v1.js` — 買収サーバ自動デプロイ（nano）
  - `apx-hud.lily.v1.js` — Overview用の軽量HUD

## クイックスタート

```bash
# 1) ルート拡大
run rooter/apx-rooter.nano.v1.js --log

# 2) HUD
run tools/apx-hud.lily.v1.js

# 3) 収益マネージャ（root済み全体から選定したい時）
run core/apx-core.micro.v2.08.js --allRooted true

# 4) 買収サーバを段階的に増強
run tools/apx-pserv.nano.v1.js --budget 0.6
```

Singularity版の自動化（`singularity/`）は SF-4 を入手してから有効にしてください。

## ライセンス

MIT License © 2025 Lily (Author)
