# bitburner-apx (Lily build) — v1.3 (Aug-start + Auto-Adapt)
- HUD は Overview の `overview-extra-hook-0/1` を使う一般的な方式（`stats.js` と同じフック構造）。
- Aug直後（Hack=1 / exe無し / 2TB Home）でも **フルオート気味**に進めるため、**Auto-Adapt Daemon** を追加。

## ▶ One-Click
```
run tools/apx-oneclick.lily.js
```
- 常駐: HUD / rooter / micro / pserv.auto / hacknet.nano / share / backdoor.guide
- 追加: **daemon.autoadapt**（既定ON） … pserv予算・share配分・batch自動ON/OFF・spread定期実行を調整

### よく使うオプション
```
# ターゲットを指定して安全バッチ (1レーン)
run tools/apx-oneclick.lily.js --withBatcher --target joesguns --hackPct 0.03 --gap 200

# root済み一般サーバにも配備
run tools/apx-oneclick.lily.js --spread
```

## 🧪 整合性チェック
```
run tools/apx-healthcheck.v1.js
```
- 必須ファイルの存在/RAM値、Infinityスレ防止点検、主要常駐の起動状態をチェック。

## 🧩 新ツール
- `tools/apx-daemon.autoadapt.v1.js` … 自動適応オーケストレータ
- `tools/apx-spread.remote.v1.js` … root済み一般サーバへ HGW ループ配備
- `tools/apx-prog.advice.v1.js` … exe 所持/不足を提示（Tor/darkweb/作成）

## wget インストール
```
run tools/apx-install.js --user <you> --repo bitburner-apx --start
```
- Private はwget不可。Public/Gistで配布。`--start` で One-Click を起動。

MIT License © 2025 Lily
