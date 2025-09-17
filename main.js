/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();

    // 設定パラメータ
    const CONFIG = {
        updateInterval: 1000,
        hackThreshold: 0.9,      // セキュリティが最小値の90%以下の時にハック
        moneyThreshold: 0.75,    // 資金が最大値の75%以上の時にハック
        ramReserve: 32,          // home用に予約するRAM
        batchDelay: 100,         // バッチ間の遅延
        stockMode: true,         // 株式市場モード
        contractSolver: true,    // 契約自動解決
        singularityMode: true,  // Singularity機能を使用
    };

    // 初期化
    ns.print("INFO: BitBurner Ultimate Controller 起動中...");
    
    // 必要なスクリプトをデプロイ
    const scripts = {
        scanner: "/lib/scanner.js",
        batcher: "/lib/batcher.js",
        grower: "/lib/grower.js",
        weakener: "/lib/weakener.js",
        manager: "/lib/manager.js",
        contract: "/lib/contract-solver.js",
        stock: "/lib/stock-trader.js",
    };

    // サーバー情報を収集
    const servers = await scanNetwork(ns);
    ns.print(`INFO: ${servers.length}台のサーバーを発見`);

    // ルート権限を取得
    await rootAllServers(ns, servers);

    // メインループ
    while (true) {
        try {
            // サーバーの状態を更新
            const targetServers = await analyzeTargets(ns, servers);
            
            // 最適なターゲットを選択
            const bestTargets = selectBestTargets(ns, targetServers, CONFIG);
            
            // バッチ攻撃を実行
            for (const target of bestTargets) {
                await executeBatchAttack(ns, target, CONFIG);
                await ns.sleep(CONFIG.batchDelay);
            }

            // 契約を解決
            if (CONFIG.contractSolver) {
                await solveContracts(ns, servers);
            }

            // 株式取引
            if (CONFIG.stockMode && ns.stock.hasWSEAccess()) {
                await manageStocks(ns);
            }

            // Singularity機能
            if (CONFIG.singularityMode) {
                await manageSingularity(ns);
            }

            await ns.sleep(CONFIG.updateInterval);
        } catch (error) {
            ns.print(`ERROR: ${error}`);
            await ns.sleep(5000);
        }
    }
}

async function scanNetwork(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }

        if (current !== "home") {
            servers.push(current);
        }
    }

    return servers;
}

async function rootAllServers(ns, servers) {
    const tools = {
        "BruteSSH.exe": ns.brutessh,
        "FTPCrack.exe": ns.ftpcrack,
        "relaySMTP.exe": ns.relaysmtp,
        "HTTPWorm.exe": ns.httpworm,
        "SQLInject.exe": ns.sqlinject
    };

    for (const server of servers) {
        if (!ns.hasRootAccess(server)) {
            let ports = 0;
            for (const [tool, func] of Object.entries(tools)) {
                if (ns.fileExists(tool, "home")) {
                    func(server);
                    ports++;
                }
            }

            const required = ns.getServerNumPortsRequired(server);
            if (ports >= required) {
                ns.nuke(server);
                ns.print(`SUCCESS: ${server} をroot化`);
            }
        }
    }
}

async function analyzeTargets(ns, servers) {
    const targets = [];
    
    for (const server of servers) {
        if (!ns.hasRootAccess(server)) continue;
        
        const maxMoney = ns.getServerMaxMoney(server);
        const currentMoney = ns.getServerMoneyAvailable(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        const currentSec = ns.getServerSecurityLevel(server);
        const hackLevel = ns.getServerRequiredHackingLevel(server);
        
        if (maxMoney > 0 && hackLevel <= ns.getHackingLevel()) {
            const score = calculateServerScore(ns, server, maxMoney, minSec);
            targets.push({
                name: server,
                maxMoney,
                currentMoney,
                minSec,
                currentSec,
                hackLevel,
                score
            });
        }
    }
    
    return targets.sort((a, b) => b.score - a.score);
}

function calculateServerScore(ns, server, maxMoney, minSec) {
    const hackTime = ns.getHackTime(server);
    const growTime = ns.getGrowTime(server);
    const weakenTime = ns.getWeakenTime(server);
    const hackChance = ns.hackAnalyzeChance(server);
    
    // スコア計算: 金額 / 時間 * 成功率
    const avgTime = (hackTime + growTime + weakenTime) / 3;
    const score = (maxMoney / avgTime) * hackChance;
    
    return score;
}

function selectBestTargets(ns, servers, config) {
    const maxTargets = Math.min(10, servers.length);
    const targets = [];
    
    for (let i = 0; i < maxTargets; i++) {
        const server = servers[i];
        const moneyRatio = server.currentMoney / server.maxMoney;
        const secRatio = server.currentSec / server.minSec;
        
        if (moneyRatio >= config.moneyThreshold && secRatio <= config.hackThreshold) {
            targets.push(server);
        }
    }
    
    // ターゲットが少ない場合は準備が必要なサーバーも含める
    if (targets.length < 3) {
        for (let i = 0; i < Math.min(3, servers.length); i++) {
            if (!targets.includes(servers[i])) {
                targets.push(servers[i]);
            }
        }
    }
    
    return targets;
}

async function executeBatchAttack(ns, target, config) {
    const server = target.name;
    
    // セキュリティが高い場合はweaken
    if (target.currentSec > target.minSec * 1.05) {
        await deployScript(ns, "/lib/weakener.js", server, calculateThreads(ns, "weaken", server));
    }
    
    // 資金が少ない場合はgrow
    if (target.currentMoney < target.maxMoney * 0.9) {
        await deployScript(ns, "/lib/grower.js", server, calculateThreads(ns, "grow", server));
    }
    
    // 条件が整っていればhack
    if (target.currentMoney >= target.maxMoney * config.moneyThreshold &&
        target.currentSec <= target.minSec * config.hackThreshold) {
        await deployScript(ns, "/lib/hacker.js", server, calculateThreads(ns, "hack", server));
    }
}

function calculateThreads(ns, action, target) {
    const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 32;
    const scriptRam = action === "hack" ? 1.7 : action === "grow" ? 1.75 : 1.75;
    
    let threads = Math.floor(availableRam / scriptRam);
    
    if (action === "hack") {
        const hackPercent = ns.hackAnalyze(target);
        const maxThreads = Math.ceil(0.5 / hackPercent); // 最大50%をハック
        threads = Math.min(threads, maxThreads);
    }
    
    return Math.max(1, threads);
}

async function deployScript(ns, script, target, threads) {
    if (!ns.fileExists(script, "home")) {
        ns.print(`WARNING: ${script} が存在しません`);
        return;
    }
    
    if (threads > 0) {
        ns.exec(script, "home", threads, target, Date.now());
    }
}

async function solveContracts(ns, servers) {
    // 契約解決ロジックは別スクリプトに委譲
    if (ns.fileExists("/lib/contract-solver.js", "home")) {
        ns.exec("/lib/contract-solver.js", "home", 1);
    }
}

async function manageStocks(ns) {
    // 株式取引ロジックは別スクリプトに委譲
    if (ns.fileExists("/lib/stock-trader.js", "home")) {
        ns.exec("/lib/stock-trader.js", "home", 1);
    }
}

async function manageSingularity(ns) {
    // オーグメンテーション購入とファクション管理
    const factions = ns.getPlayer().factions;
    for (const faction of factions) {
        const rep = ns.singularity.getFactionRep(faction);
        const favor = ns.singularity.getFactionFavor(faction);
        
        // オーグメンテーションの自動購入
        const augs = ns.singularity.getAugmentationsFromFaction(faction);
        for (const aug of augs) {
            const cost = ns.singularity.getAugmentationCost(aug);
            if (cost[1] <= rep && cost[0] <= ns.getServerMoneyAvailable("home")) {
                ns.singularity.purchaseAugmentation(faction, aug);
                ns.print(`SUCCESS: ${aug} を購入`);
            }
        }
    }
}