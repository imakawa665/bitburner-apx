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