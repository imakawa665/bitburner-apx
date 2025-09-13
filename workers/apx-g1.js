/** workers/apx-g1.js: single grow worker */
export async function main(ns){ const F=ns.flags([['target','n00dles']]); await ns.grow(String(F.target)); }
