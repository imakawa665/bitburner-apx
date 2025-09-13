
/** workers/apx-w1.js - simple weaken worker */
export async function main(ns) {
  const target = String(ns.args[0] || 'n00dles');
  while (true) {
    try { await ns.weaken(target); } catch { }
  }
}
