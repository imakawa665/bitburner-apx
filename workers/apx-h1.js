/** workers/apx-h1.js: single hack worker */
export async function main(ns){ const F=ns.flags([['target','n00dles'],['pct',0.03]]); await ns.hack(String(F.target), {hackPercent: Math.max(0.001, Math.min(0.99, Number(F.pct)||0.03))}); }
