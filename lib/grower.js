// lib/grower.js
/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const delay = ns.args[1] || 0;
    
    if (!target) {
        ns.print("ERROR: ターゲットが指定されていません");
        return;
    }
    
    await ns.sleep(delay);
    const growth = await ns.grow(target);
    
    if (growth > 1) {
        ns.print(`SUCCESS: ${target}の資金を${growth.toFixed(2)}倍に成長`);
    }
}