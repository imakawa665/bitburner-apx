/** @param {NS} ns 
 * 高精度バッチ攻撃システム
 * HWGW (Hack-Weaken-Grow-Weaken) サイクルを実行
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const target = ns.args[0] || findBestTarget(ns);
    
    if (!target) {
        ns.print("ERROR: 有効なターゲットが見つかりません");
        return;
    }
    
    ns.tail();
    ns.print(`INFO: ${target}に対してバッチ攻撃を開始`);
    
    // 初期準備 - サーバーを最適な状態にする
    await prepareServer(ns, target);
    
    // バッチ攻撃のループ
    while (true) {
        const batch = calculateOptimalBatch(ns, target);
        
        if (batch.threads.hack > 0) {
            await executeBatch(ns, target, batch);
        } else {
            // リソース不足の場合は再準備
            await ns.sleep(1000);
            await prepareServer(ns, target);
        }
        
        await ns.sleep(200); // バッチ間の遅延
    }
}

function findBestTarget(ns) {
    const servers = getAllServers(ns);
    let bestTarget = null;
    let bestScore = 0;
    
    for (const server of servers) {
        if (!ns.hasRootAccess(server)) continue;
        
        const maxMoney = ns.getServerMaxMoney(server);
        if (maxMoney === 0) continue;
        
        const hackLevel = ns.getServerRequiredHackingLevel(server);
        if (hackLevel > ns.getHackingLevel()) continue;
        
        const score = calculateServerValue(ns, server);
        if (score > bestScore) {
            bestScore = score;
            bestTarget = server;
        }
    }
    
    return bestTarget;
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

function calculateServerValue(ns, server) {
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    const hackTime = ns.getHackTime(server);
    const hackChance = ns.hackAnalyzeChance(server);
    
    // 価値 = (最大資金 * ハック成功率) / ハック時間
    return (maxMoney * hackChance) / (hackTime / 1000);
}

async function prepareServer(ns, target) {
    const minSec = ns.getServerMinSecurityLevel(target);
    const maxMoney = ns.getServerMaxMoney(target);
    
    let prepared = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!prepared && attempts < maxAttempts) {
        const currentSec = ns.getServerSecurityLevel(target);
        const currentMoney = ns.getServerMoneyAvailable(target);
        
        // セキュリティを最小化
        if (currentSec > minSec + 0.05) {
            const threads = calculateWeakenThreads(ns, target, currentSec - minSec);
            if (threads > 0) {
                await runScript(ns, "/lib/weakener.js", threads, target);
                await ns.sleep(ns.getWeakenTime(target) + 100);
            }
        }
        // 資金を最大化
        else if (currentMoney < maxMoney * 0.99) {
            const growthNeeded = maxMoney / Math.max(1, currentMoney);
            const threads = calculateGrowThreads(ns, target, growthNeeded);
            if (threads > 0) {
                await runScript(ns, "/lib/grower.js", threads, target);
                await ns.sleep(ns.getGrowTime(target) + 100);
                
                // Growによるセキュリティ上昇を補正
                const secIncrease = ns.growthAnalyzeSecurity(threads);
                const weakenThreads = calculateWeakenThreads(ns, target, secIncrease);
                if (weakenThreads > 0) {
                    await runScript(ns, "/lib/weakener.js", weakenThreads, target);
                    await ns.sleep(ns.getWeakenTime(target) + 100);
                }
            }
        }
        else {
            prepared = true;
            ns.print(`SUCCESS: ${target}の準備完了`);
        }
        
        attempts++;
    }
}

function calculateOptimalBatch(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const currentSec = ns.getServerSecurityLevel(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    
    // 利用可能なRAMを計算
    const homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 64;
    const hackRam = 1.7;
    const growRam = 1.75;
    const weakenRam = 1.75;
    
    // 最適なハック割合を計算 (20-50%の範囲)
    const hackPercent = Math.min(0.5, Math.max(0.2, currentMoney / maxMoney * 0.5));
    const hackAmount = currentMoney * hackPercent;
    
    // 必要なスレッド数を計算
    const hackThreads = Math.max(1, Math.floor(hackPercent / ns.hackAnalyze(target)));
    const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads);
    const weakenHackThreads = Math.ceil(hackSecIncrease / ns.weakenAnalyze(1));
    
    // Grow計算
    const moneyAfterHack = currentMoney - hackAmount;
    const growthNeeded = maxMoney / Math.max(1, moneyAfterHack);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded));
    const growSecIncrease = ns.growthAnalyzeSecurity(growThreads);
    const weakenGrowThreads = Math.ceil(growSecIncrease / ns.weakenAnalyze(1));
    
    // RAM制限をチェック
    const totalRam = (hackThreads * hackRam) + 
                     (growThreads * growRam) + 
                     (weakenHackThreads * weakenRam) + 
                     (weakenGrowThreads * weakenRam);
    
    if (totalRam > homeRam) {
        // RAM不足の場合はスケールダウン
        const scale = homeRam / totalRam * 0.9;
        return {
            threads: {
                hack: Math.max(1, Math.floor(hackThreads * scale)),
                weakenHack: Math.max(1, Math.floor(weakenHackThreads * scale)),
                grow: Math.max(1, Math.floor(growThreads * scale)),
                weakenGrow: Math.max(1, Math.floor(weakenGrowThreads * scale))
            },
            timing: calculateBatchTiming(ns, target)
        };
    }
    
    return {
        threads: {
            hack: hackThreads,
            weakenHack: weakenHackThreads,
            grow: growThreads,
            weakenGrow: weakenGrowThreads
        },
        timing: calculateBatchTiming(ns, target)
    };
}

function calculateBatchTiming(ns, target) {
    const hackTime = ns.getHackTime(target);
    const growTime = ns.getGrowTime(target);
    const weakenTime = ns.getWeakenTime(target);
    
    // バッチの実行順序とタイミングを計算
    // すべての操作が200msの間隔で終了するようにする
    const endTime = weakenTime;
    const spacing = 200;
    
    return {
        hack: endTime - hackTime - spacing * 3,
        weakenHack: endTime - weakenTime - spacing * 2,
        grow: endTime - growTime - spacing,
        weakenGrow: 0  // 最後に実行
    };
}

async function executeBatch(ns, target, batch) {
    const timestamp = Date.now();
    const scripts = [
        { script: "/lib/hacker.js", threads: batch.threads.hack, delay: batch.timing.hack },
        { script: "/lib/weakener.js", threads: batch.threads.weakenHack, delay: batch.timing.weakenHack },
        { script: "/lib/grower.js", threads: batch.threads.grow, delay: batch.timing.grow },
        { script: "/lib/weakener.js", threads: batch.threads.weakenGrow, delay: batch.timing.weakenGrow }
    ];
    
    // 全スクリプトを同時に起動
    for (const { script, threads, delay } of scripts) {
        if (threads > 0) {
            ns.exec(script, "home", threads, target, delay, timestamp);
        }
    }
    
    ns.print(`INFO: バッチ実行 - H:${batch.threads.hack} W:${batch.threads.weakenHack} G:${batch.threads.grow} W:${batch.threads.weakenGrow}`);
}

function calculateWeakenThreads(ns, target, securityDecrease) {
    return Math.ceil(securityDecrease / ns.weakenAnalyze(1));
}

function calculateGrowThreads(ns, target, growthMultiplier) {
    return Math.ceil(ns.growthAnalyze(target, growthMultiplier));
}

async function runScript(ns, script, threads, ...args) {
    if (threads > 0 && ns.fileExists(script, "home")) {
        return ns.exec(script, "home", threads, ...args);
    }
    return 0;
}