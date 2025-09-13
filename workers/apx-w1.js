/** workers/apx-w1.js: single weaken worker */
export async function main(ns){ const F=ns.flags([['target','n00dles']]); await ns.weaken(String(F.target)); }
