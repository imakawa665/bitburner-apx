/** @param {NS} ns 
 * BitBurner Ultimate Scripts セットアップ
 * GitHubから全スクリプトを自動ダウンロード＆デプロイ
 */
export async function main(ns) {
    ns.tprint("=================================");
    ns.tprint("BitBurner Ultimate Scripts Setup");
    ns.tprint("=================================");
    
    const GITHUB_BASE = "https://raw.githubusercontent.com/[YOUR_USERNAME]/bitburner-scripts/main/";
    
    // ダウンロードするファイルのリスト
    const files = [
        "main.js",
        "setup.js",
        "lib/hacker.js",
        "lib/grower.js",
        "lib/weakener.js",
        "lib/batch-controller.js",
        "lib/stock-trader.js",
        "lib/contract-solver.js",
        "lib/scanner.js",
        "lib/manager.js",
        "lib/server-buyer.js",
        "lib/hacknet-manager.js",
        "lib/gang-manager.js",
        "lib/corp-manager.js",
        "tools/monitor.js",
        "tools/analyze.js",
        "tools/benchmark.js"
    ];
    
    // 既存のプロセスを停止
    ns.tprint("INFO: 既存のプロセスを停止中...");
    ns.killall("home");
    await ns.sleep(1000);
    
    // ディレクトリ構造を作成
    ns.tprint("INFO: ディレクトリ構造を作成中...");
    createDirectories(ns);
    
    // スクリプトのダウンロード
    ns.tprint("INFO: スクリプトをダウンロード中...");
    let downloadedCount = 0;
    let failedDownloads = [];
    
    for (const file of files) {
        const url = GITHUB_BASE + file;
        const success = await ns.wget(url, file, "home");
        
        if (success) {
            downloadedCount++;
            ns.tprint(`  ✓ ${file}`);
        } else {
            failedDownloads.push(file);
            ns.tprint(`  ✗ ${file} - ダウンロード失敗`);
        }
        
        await ns.sleep(100);
    }
    
    ns.tprint("");
    ns.tprint(`ダウンロード完了: ${downloadedCount}/${files.length} ファイル`);
    
    if (failedDownloads.length > 0) {
        ns.tprint("警告: 以下のファイルのダウンロードに失敗しました:");
        failedDownloads.forEach(f => ns.tprint(`  - ${f}`));
        ns.tprint("手動でダウンロードするか、GitHubのURLを確認してください。");
    }
    
    // 設定ファイルの作成
    await createConfigFile(ns);
    
    // エイリアスの設定
    setupAliases(ns);
    
    // メインスクリプトの起動
    const shouldStart = await ns.prompt("メインスクリプトを起動しますか？");
    if (shouldStart) {
        ns.spawn("main.js", 1);
    } else {
        ns.tprint("");
        ns.tprint("セットアップ完了！");
        ns.tprint("以下のコマンドでメインスクリプトを起動できます:");
        ns.tprint("  run main.js");
        ns.tprint("");
        ns.tprint("その他の便利なコマンド:");
        ns.tprint("  run tools/monitor.js     - リアルタイムモニター");
        ns.tprint("  run tools/analyze.js      - サーバー分析");
        ns.tprint("  run lib/stock-trader.js   - 株式取引");
        ns.tprint("  run lib/contract-solver.js - 契約解決");
    }
}

function createDirectories(ns) {
    // BitBurnerではディレクトリは自動的に作成されるため、
    // ファイル作成時にパスを指定すれば良い
    // この関数は将来の拡張のために残しておく
}

async function createConfigFile(ns) {
    const config = {
        // メイン設定
        main: {
            updateInterval: 1000,
            hackThreshold: 0.9,
            moneyThreshold: 0.75,
            ramReserve: 32,
            batchDelay: 100,
            stockMode: true,
            contractSolver: true,
            singularityMode: true
        },
        
        // 株式取引設定
        stock: {
            updateInterval: 2000,
            maxPositions: 10,
            minForecast: 0.55,
            maxForecast: 0.45,
            reserveCash: 1000000000,
            maxPositionSize: 0.3,
            stopLoss: 0.15,
            takeProfit: 0.50,
            useShorts: false,
            commission: 100000
        },
        
        // バッチ攻撃設定
        batch: {
            maxTargets: 10,
            hackPercent: 0.5,
            prepareIterations: 100,
            timingSpacing: 200
        },
        
        // サーバー購入設定
        serverPurchase: {
            enabled: true,
            maxServers: 25,
            ramExponent: 20, // 2^20 = 1048576 GB
            namePrefix: "pserv-"
        },
        
        // Hacknet設定
        hacknet: {
            enabled: true,
            maxNodes: 30,
            upgradeThreshold: 0.1, // ROIが10%以上なら購入
            maxSpend: 1000000000 // 最大10億まで投資
        }
    };
    
    const configStr = JSON.stringify(config, null, 2);
    await ns.write("config.json", configStr, "w");
    ns.tprint("設定ファイル (config.json) を作成しました");
}

function setupAliases(ns) {
    // よく使うコマンドのエイリアスを設定
    const aliases = [
        { alias: "start", command: "run main.js" },
        { alias: "stop", command: "killall" },
        { alias: "mon", command: "run tools/monitor.js" },
        { alias: "analyze", command: "run tools/analyze.js" },
        { alias: "stock", command: "run lib/stock-trader.js" },
        { alias: "batch", command: "run lib/batch-controller.js" },
        { alias: "contracts", command: "run lib/contract-solver.js" },
        { alias: "buy-servers", command: "run lib/server-buyer.js" },
        { alias: "scan", command: "run lib/scanner.js" },
        { alias: "update", command: "run setup.js" }
    ];
    
    ns.tprint("便利なエイリアスを設定中...");
    
    // 注: ns.alias() は存在しないため、手動で設定する必要があります
    ns.tprint("以下のエイリアスをターミナルで手動設定してください:");
    aliases.forEach(({ alias, command }) => {
        ns.tprint(`  alias ${alias}="${command}"`);
    });
}