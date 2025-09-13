# APX 起動オプション早見表（v1.8.1）

> HUD は `overview-extra-hook-0/1` を使用する実装なので、あなたの `stats.js` と安全に共存します。

## よく使うコマンド

```text
# フルオート（おすすめ）
run tools/apx-oneclick.lily.js --profile autofull

# 収益特化（バッチャON）
run tools/apx-oneclick.lily.js --profile moneypush

# 初期整備（クラッカー購入→root拡大）
run tools/apx-oneclick.lily.js --profile setup
```

## One‑Click v1.8（tools/apx-oneclick.lily.js）

- `--profile <lowram|moneypush|reppush|casino|karma|stanek|setup|autofull>`
- `--autopilot`（`--profile autofull` と同じ）
- ON/OFF: `--rooter/--hud/--micro/--pserv/--hacknet/--share/--spread/--backdoor/--advice/--daemon/--hash`
- バッチャ: `--withBatcher --target <host> --hackPct <0..1> --gap <ms> --lanes <1..3>`
- pserv: `--pservBudget <0..1> --pservMin <ram> --pservMax <ram>`
- Share: `--sharePct <0..1>`
- Dark Web: `--darkweb --dwMode ports|all --dwQol --dwSafety <係数> --dwMethod auto|dom|singularity --dwInterval <ms>`

## Autopilot v1.8.1（tools/apx-autopilot.full.v1.js）

- `--interval <ms>`（デフォ 5000） / `--goal <money>`（1e9 到達でCasino抑止）
- `--uiLock /Temp/apx.ui.lock.txt`（DOM排他ロック）
- `--hud true|false`（HUD自動起動）
- 学習/訓練 DOM: `--autostudy true|false --studyHackTo <Lv> --trainAgiTo <Lv>`
- 犯罪: `--crimeAuto true|false --karmaGoal -54000`

## Daemon v1.6.1（tools/apx-daemon.autoadapt.v1.js）

- `--interval <ms>` / シェア: `--minSharePct --maxSharePct`
- バッチャ空きRAM閾値: `--batchMinFree --batchMaxFree`
- pserv: `--pservMin --pservMax`
- `--spreadInterval <ms>` / `--healthInterval <ms>`
- Casino: `--casino true|false --casinoGoal <money>`（banフラグを尊重）
- `--darkweb true|false`（不足クラッカーでバイヤー自動）

## Dark Web Buyer v1.1（tools/apx-darkweb.autobuyer.v1.js）

- `--mode ports|all` / `--qol` / `--safety <係数>` / `--interval <ms>` / `--method auto|dom|singularity` / `--log`
- `--autoRooterRestart`（購入のたびに rooter 再走）

## Batcher v1.2.3（tools/apx-hgw-batcher.v1.2.js）

- `--target <host> --hackPct <0..1> --gap <ms> --lanes <1..3>`（**sleepの競合修正済み**）

## Backdoor

- ガイド v1.2.1: `tools/apx-backdoor.guide.v1.js --watch 3000`
- 自動 DOM v1.0: `tools/apx-backdoor.auto.dom.v1.js --lock /Temp/apx.ui.lock.txt --watch 6000`

## インストーラ v1.8（tools/apx-install.js）

```text
wget https://raw.githubusercontent.com/<user>/<repo>/<branch>/tools/apx-install.js tools/apx-install.js
run tools/apx-install.js --user <user> --repo <repo> --branch main --start
# --start で One‑Click を --profile autofull で自動起動
```
