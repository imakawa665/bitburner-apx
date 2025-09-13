
/** workers/apx-g1.js - simple grow worker */
export async function main(ns) {
  const target = String(ns.args[0] || 'n00dles');
  while (true) {
    try { await ns.grow(target); } catch { }
  }
}
