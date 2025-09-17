// lib/weakener.js
/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const delay = ns.args[1] || 0;
    
    if (!target) {
        ns.print("ERROR: ターゲットが指定されていません");
        return;
    }
    
    await ns.sleep(delay);
    const weakened = await ns.weaken(target);
    
    if (weakened > 0) {
        ns.print(`SUCCESS: ${target}のセキュリティを${weakened.toFixed(2)}低下`);
    }
}