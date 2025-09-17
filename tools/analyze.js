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