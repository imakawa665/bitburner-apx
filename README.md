# APX Full v1.9.3

- `tools/apx-oneclick.lily.js --profile autofull` … 資金ブースト（batcher自動ON/OFF）
- `tools/apx-oneclick.lily.js --profile rep` …… REPブースト（Share全展開 + Faction Work DOM）

**reserve** を共有します：`tools/apx-reserve.set.v1.js 500000000` で 500m を確保。  
HUD は `tools/apx-hud.lily.v1.js`（stats.js 方式で overview-extra-hook を使用）。fileciteturn0file0

主要構成：
- Autopilot v1.9.3（高速ループ / reserve対応 / REPマーカー）
- Darkweb buyer（`buy -a` 対応）/ Rooter / Micro展開 / Batcher（簡易）
- Share Manager / Faction Work DOM / Hash spender / pserv scaler / healthcheck
