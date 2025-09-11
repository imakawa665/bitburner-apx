# bitburner-apx (Lily build) — v1.2 (Aug-start)
> **Post-augmentation 最適化**：Aug直後のハッキングLv=1 / 所持.exe少なめでも **2TB Home** を最大活用して自動化。
> HUD は Overview の `overview-extra-hook-0/1` を使う一般的な方式（`stats.js` と同じフック構造）。

## One-Click 起動
```
run tools/apx-oneclick.lily.js
```
- 常駐：HUD / rooter / micro / pserv.auto / hacknet.nano / share
- 任意：spread（root済みリモートへHGW配布）/ backdoor.guide（常時）/ batcher（指定ターゲット）/ prog.advice（次手アドバイス）

### オプション例
```
# 簡易バッチャも一緒に、ターゲット指定
run tools/apx-oneclick.lily.js --withBatcher --target joesguns --hackPct 0.03 --gap 200

# spread で root済みリモートにも配布
run tools/apx-oneclick.lily.js --spread --target n00dles

# pserv 予算調整 / RAM段階引上げ
run tools/apx-oneclick.lily.js --pservBudget 0.4 --pservMin 8 --pservMax 16384
```

## 追加ツール
- `tools/apx-spread.remote.v1.js` … root済み一般サーバへ HGW ループを一括配備
- `tools/apx-prog.advice.v1.js` … 所持.exeの確認と次アクションの提案（Tor / darkweb / Create Program）
- `tools/apx-cmd.*` … micro へターゲット固定/モード切替を Port20 で送信
- `tools/apx-share.nano.v1.js` … 余りRAMで share()

## デバッグログ
- 主要スクリプトに `--log` フラグを追加（**ロジックは非変更**）。起動/計算/購入/配備など要所を `ns.print/ns.tprint` で出力。
  - 対象：micro v2.09, rooter.auto, pserv.auto/nano, batcher, hacknet.nano, HUD, oneclick, loop-hgw

## wget インストール
```
run tools/apx-install.js --user <you> --repo bitburner-apx --start
```
- Private リポは `wget` 不可（Public/Gistを利用）。`--start` で **One-Click** を起動。

## 推奨運用（Aug直後）
1) `apx-prog.advice.v1.js` の出力を見て **NUKE.exe** を最優先（Tor→darkweb購入 or Create Program）。  
2) `apx-oneclick.lily.js` を実行（Hacknet+Shareで資金確保、rooter待機）。  
3) root取得でき次第、micro/batcher/spread が **2TB Home** を活かし最大DPS化。

MIT License © 2025 Lily
