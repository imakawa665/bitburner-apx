/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const delay = ns.args[1] || 0;
    
    if (!target) {
        ns.print("ERROR: ターゲットが指定されていません");
        return;
    }
    
    await ns.sleep(delay);
    const stolen = await ns.hack(target);
    
    if (stolen > 0) {
        ns.print(`SUCCESS: ${target}から$${ns.formatNumber(stolen)}を奪取`);
    }
}