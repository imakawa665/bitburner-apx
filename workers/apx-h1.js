
/** workers/apx-h1.js - simple hack worker */
export async function main(ns) {
  const target = String(ns.args[0] || 'n00dles');
  while (true) {
    try { await ns.hack(target); } catch { }
  }
}
