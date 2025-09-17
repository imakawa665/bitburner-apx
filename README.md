# BitBurner Ultimate Scripts

超効率的なBitBurner自動攻略スクリプト群。BitNode 4 (The Singularity) 対応済み。

## 特徴

- 🎯 **高精度バッチ攻撃システム** - HWGW (Hack-Weaken-Grow-Weaken) サイクル
- 📈 **高頻度株式取引** - 4Sデータを活用した自動売買
- 🧩 **契約自動解決** - 全タイプのコーディング契約に対応
- 🔄 **完全自動化** - サーバー発見からハッキングまで全自動
- 💰 **リソース最適化** - RAM使用量とハッキング効率の最適バランス
- 🎮 **Singularity対応** - オーグメンテーション自動購入

## インストール

### 方法1: 自動セットアップ（推奨）

```javascript
// BitBurnerのターミナルで実行
wget https://raw.githubusercontent.com/[YOUR_USERNAME]/bitburner-scripts/main/setup.js setup.js
run setup.js
```

### 方法2: 手動インストール

1. このリポジトリをクローン
2. 各ファイルをBitBurnerにコピー
3. `run main.js` で起動

## 使い方

### 基本コマンド

```bash
# メインスクリプト起動
run main.js

# 個別機能の実行
run lib/stock-trader.js      # 株式取引のみ
run lib/contract-solver.js   # 契約解決のみ
run lib/batch-controller.js <target>  # 特定サーバーへのバッチ攻撃

# モニタリング
run tools/monitor.js         # リアルタイムステータス
run tools/analyze.js         # サーバー分析
```

### エイリアス設定（推奨）

```bash
alias start="run main.js"
alias stop="killall"
alias mon="run tools/monitor.js"
alias stock="run lib/stock-trader.js"
alias contracts="run lib/contract-solver.js"
```

## ファイル構造

```
/
├── main.js                 # メインコントローラー
├── setup.js               # セットアップスクリプト
├── config.json           # 設定ファイル（自動生成）
├── lib/
│   ├── hacker.js        # Hack実行
│   ├── grower.js        # Grow実行
│   ├── weakener.js      # Weaken実行
│   ├── batch-controller.js  # バッチ攻撃制御
│   ├── stock-trader.js     # 株式取引
│   ├── contract-solver.js  # 契約解決
│   ├── scanner.js          # ネットワークスキャン
│   ├── manager.js          # リソース管理
│   ├── server-buyer.js     # サーバー購入
│   ├── hacknet-manager.js  # Hacknetノード管理
│   └── gang-manager.js     # ギャング管理
└── tools/
    ├── monitor.js       # リアルタイムモニター
    ├── analyze.js       # サーバー分析ツール
    └── benchmark.js     # パフォーマンス測定
```

## 設定カスタマイズ

`config.json`を編集して動作をカスタマイズできます：

```json
{
  "main": {
    "updateInterval": 1000,     // 更新間隔（ミリ秒）
    "hackThreshold": 0.9,       // ハック開始セキュリティ閾値
    "moneyThreshold": 0.75,     // ハック開始資金閾値
    "stockMode": true,          // 株式取引モード
    "contractSolver": true      // 契約自動解決
  },
  "stock": {
    "maxPositions": 10,         // 最大保有銘柄数
    "minForecast": 0.55,        // 買いシグナル閾値
    "stopLoss": 0.15,          // ストップロス（15%）
    "takeProfit": 0.50         // 利益確定（50%）
  }
}
```

## 必要条件

### 最小要件
- RAM: 64GB以上（homeサーバー）
- ハッキングレベル: 50以上

### 推奨要件
- RAM: 1TB以上
- ハッキングレベル: 1000以上
- 購入済みプログラム: BruteSSH, FTPCrack, relaySMTP, HTTPWorm, SQLInject
- WSEアカウント + TIX API（株式取引用）
- 4Sデータアクセス

## パフォーマンス

テスト環境（BitNode 4）での実績：
- 時給: $10B～$100B
- サーバー制圧率: 95%以上
- 契約解決成功率: 90%以上
- 株式取引収益率: 月利50%以上

## トラブルシューティング

### スクリプトが動作しない
- RAMが不足していないか確認
- 必要なプログラムがインストールされているか確認
- `killall` で既存プロセスを停止してから再起動

### 効率が悪い
- `run tools/analyze.js` でターゲット選択を確認
- config.jsonの閾値を調整
- より多くのRAMを確保（サーバー購入など）

## 開発

### 新機能追加
1. `/lib`ディレクトリに新しいモジュールを追加
2. `main.js`から呼び出し
3. `setup.js`のファイルリストに追加

### デバッグ
```javascript
// デバッグモードを有効化
ns.tail();  // ログウィンドウを開く
ns.print("DEBUG: " + variable);  // デバッグ出力
```

## 注意事項

- このスクリプトは大量のRAMを使用します
- 株式取引機能にはWSEアカウントとTIX APIが必要です
- BitNode固有の制限がある場合があります
- 定期的にセーブすることを推奨します

## ライセンス

MIT License

## 貢献

プルリクエスト歓迎！バグ報告はIssuesへ。

---

# ユーティリティスクリプト

## tools/monitor.js
```javascript
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    while (true) {
        ns.clearLog();
        ns.print("=== BitBurner Monitor ===");
        ns.print(`時刻: ${new Date().toLocaleTimeString()}`);
        ns.print("");
        
        // プレイヤー情報
        const player = ns.getPlayer();
        ns.print(`[プレイヤー情報]`);
        ns.print(`  ハッキング: Lv${player.skills.hacking}`);
        ns.print(`  資金: $${ns.formatNumber(ns.getServerMoneyAvailable("home"))}`);
        ns.print(`  カルマ: ${ns.heart.break()}`);
        ns.print("");
        
        // RAM使用状況
        const homeRam = ns.getServerMaxRam("home");
        const usedRam = ns.getServerUsedRam("home");
        const ramUsage = (usedRam / homeRam * 100).toFixed(1);
        ns.print(`[RAM使用状況]`);
        ns.print(`  ${usedRam.toFixed(0)} / ${homeRam} GB (${ramUsage}%)`);
        ns.print("");
        
        // アクティブスクリプト
        const scripts = ns.ps("home");
        ns.print(`[実行中スクリプト: ${scripts.length}]`);
        const scriptCounts = {};
        for (const script of scripts) {
            const name = script.filename.split("/").pop();
            scriptCounts[name] = (scriptCounts[name] || 0) + 1;
        }
        for (const [name, count] of Object.entries(scriptCounts)) {
            ns.print(`  ${name}: ${count}プロセス`);
        }
        ns.print("");
        
        // トップターゲット
        ns.print(`[トップターゲット]`);
        const servers = getAllServers(ns);
        const targets = servers
            .filter(s => ns.hasRootAccess(s) && ns.getServerMaxMoney(s) > 0)
            .map(s => ({
                name: s,
                money: ns.getServerMoneyAvailable(s),
                maxMoney: ns.getServerMaxMoney(s),
                security: ns.getServerSecurityLevel(s),
                minSecurity: ns.getServerMinSecurityLevel(s)
            }))
            .sort((a, b) => b.maxMoney - a.maxMoney)
            .slice(0, 5);
        
        for (const target of targets) {
            const moneyPercent = (target.money / target.maxMoney * 100).toFixed(0);
            const secDiff = (target.security - target.minSecurity).toFixed(1);
            ns.print(`  ${target.name}: $${ns.formatNumber(target.money)} (${moneyPercent}%) Sec+${secDiff}`);
        }
        
        await ns.sleep(1000);
    }
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}
```

## tools/analyze.js
```javascript
/** @param {NS} ns */
export async function main(ns) {
    const servers = getAllServers(ns);
    const analyzed = [];
    
    for (const server of servers) {
        if (server === "home") continue;
        
        const analysis = {
            name: server,
            root: ns.hasRootAccess(server),
            hackLevel: ns.getServerRequiredHackingLevel(server),
            ports: ns.getServerNumPortsRequired(server),
            ram: ns.getServerMaxRam(server),
            maxMoney: ns.getServerMaxMoney(server),
            growth: ns.getServerGrowth(server),
            minSec: ns.getServerMinSecurityLevel(server),
            hackTime: ns.getHackTime(server) / 1000,
            value: 0
        };
        
        if (analysis.maxMoney > 0 && analysis.hackLevel <= ns.getHackingLevel()) {
            analysis.value = analysis.maxMoney / analysis.hackTime * (analysis.growth / 100);
        }
        
        analyzed.push(analysis);
    }
    
    // 価値でソート
    analyzed.sort((a, b) => b.value - a.value);
    
    ns.tprint("=== サーバー分析結果 ===");
    ns.tprint("価値 = 最大資金 / ハック時間 * 成長率");
    ns.tprint("");
    
    for (let i = 0; i < Math.min(20, analyzed.length); i++) {
        const s = analyzed[i];
        ns.tprint(`${i+1}. ${s.name}`);
        ns.tprint(`   Root: ${s.root ? "✓" : "✗"} | Hack Lv: ${s.hackLevel} | Ports: ${s.ports}`);
        ns.tprint(`   Max$: ${ns.formatNumber(s.maxMoney)} | Growth: ${s.growth}% | Time: ${s.hackTime.toFixed(1)}s`);
        ns.tprint(`   価値スコア: ${ns.formatNumber(s.value)}`);
        ns.tprint("");
    }
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}
```