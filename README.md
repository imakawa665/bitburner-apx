# bitburner-apx (Lily build)

Bitburner 用の軽量・高効率スクリプト集。HUD は Overview の `overview-extra-hook-0/1` を使う方式（一般的な手法）です。 
これはあなたの `stats.js` と同じフック構造なので共存しやすいです。

## 主要フォルダ
- core/ … マネージャ（v2.09 は高RAM向け）
- rooter/ … ルーター（単発/常駐）
- workers/ … 単発 H/G/W と HGW ループ
- tools/ … バックドア・pserv・Hacknet・バッチャ・インストーラ・起動テンプレ・HUD
- singularity/ … SF-4 前提の自動化

## すぐ起動
```
run rooter/apx-rooter.auto.v1.js --interval 10000 --log
run tools/apx-hud.lily.v1.js
run core/apx-core.micro.v2.09.js --allRooted true
run tools/apx-pserv.auto.v1.js --budget 0.5 --minRam 64 --maxRam 8192
run tools/apx-hacknet.nano.v1.js --budget 0.2 --maxROI 3600
```
一括:
```
run tools/apx-startup.lily.js
```

## wget インストール
```
run tools/apx-install.js --user <you> --repo bitburner-apx --start
```
Private リポは wget 不可のため、配布用に Public repo / Secret Gist を使ってください。

MIT License © 2025 Lily
